import { create } from 'zustand';
import type { AIResponse, Character, Message, ChatSummary } from '../types';
import { OpenAIProvider, AIResponseSchema } from '../services/aiProvider';
import { buildChatContext, needsSummary } from '../services/contextBuilder';
import { useChatStore } from './chatStore';
import { useSettingsStore } from './settingsStore';
import { db } from '../db';

interface AIState {
  isStreaming: boolean;
  abortController: AbortController | null;
  error: string | null;
  sendMessage: (character: Character, text: string) => Promise<void>;
  stopStreaming: () => void;
  clearError: () => void;
}

export const useAIStore = create<AIState>((set, get) => ({
  isStreaming: false,
  abortController: null,
  error: null,

  sendMessage: async (character: Character, text: string) => {
    const settings = useSettingsStore.getState().settings;

    if (!settings.apiKey) {
      set({ error: 'Введите API ключ в настройках' });
      return;
    }

    const chatStore = useChatStore.getState();
    let chat = chatStore.currentChat;

    // Create chat if none exists
    if (!chat) {
      chat = await chatStore.createChat(character.id);
      await chatStore.openChat(chat.id);
    }

    // Add user message
    const userMessage: Message = {
      id: crypto.randomUUID(),
      chatId: chat.id,
      role: 'user',
      content: text,
      timestamp: new Date().toISOString()
    };
    await chatStore.addMessage(userMessage);

    // Build context
    const messages = chatStore.messages;
    let summary: ChatSummary | undefined;

    if (needsSummary(messages.length)) {
      try {
        const provider = new OpenAIProvider(settings.apiKey);
        summary = await provider.summarizeConversation(messages.slice(0, -MAX_RECENT_MESSAGES));
        // Save summary to DB for future use
        await db.cache.put({ key: `summary:${chat.id}`, value: summary, expiresAt: Date.now() + 86400000 });
      } catch {
        // Summary failed, continue without it
      }
    }

    const contextMessages = buildChatContext(character, messages, text, summary);

    // Start streaming
    const abortController = new AbortController();
    set({ isStreaming: true, abortController, error: null });

    // Create placeholder for assistant message
    const assistantMessageId = crypto.randomUUID();
    let streamedContent = '';

    const provider = new OpenAIProvider(settings.apiKey);

    try {
      const response = await provider.sendMessage(
        contextMessages,
        character,
        (chunk) => {
          streamedContent += chunk;
          // Update UI in real-time
          chatStore.setMessages([
            ...chatStore.messages,
            {
              id: assistantMessageId,
              chatId: chat!.id,
              role: 'assistant',
              content: streamedContent,
              timestamp: new Date().toISOString()
            }
          ]);
        },
        abortController.signal
      );

      // Save final message
      const assistantMessage: Message = {
        id: assistantMessageId,
        chatId: chat.id,
        role: 'assistant',
        content: response.content,
        timestamp: new Date().toISOString(),
        mood: response.mood,
        actions: response.actions,
        metadata: response.metadata
      };
      await chatStore.addMessage(assistantMessage);
    } catch (error: any) {
      if (error.name === 'AbortError') {
        // User cancelled — save partial response
        if (streamedContent) {
          await chatStore.addMessage({
            id: assistantMessageId,
            chatId: chat.id,
            role: 'assistant',
            content: streamedContent,
            timestamp: new Date().toISOString(),
            done: false
          } as Message);
        }
      } else {
        set({ error: error.message || 'Ошибка при отправке сообщения' });
      }
    } finally {
      set({ isStreaming: false, abortController: null });
    }
  },

  stopStreaming: () => {
    const { abortController } = get();
    if (abortController) {
      abortController.abort();
    }
  },

  clearError: () => set({ error: null })
}));
