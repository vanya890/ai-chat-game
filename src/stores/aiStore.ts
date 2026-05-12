import { create } from 'zustand';
import type { AIResponse, Character, Message, ChatSummary } from '../types';
import { OpenAIProvider, AI_RESPONSE_SCHEMA } from '../services/aiProvider';
import { buildChatContext, needsSummary } from '../services/contextBuilder';
import { useChatStore } from './chatStore';
import { useSettingsStore } from './settingsStore';
import { useTokenStore } from './tokenStore';
import { db } from '../db';

const MAX_RECENT_MESSAGES = 10;

interface AIState {
  isStreaming: boolean;
  abortController: AbortController | null;
  error: string | null;
  sendMessage: (character: Character, text: string) => Promise<void>;
  stopStreaming: () => void;
  clearError: () => void;
  generateCharacter: (description: string) => Promise<Partial<Character>>;
}

function getProvider(character: Character) {
  const settings = useSettingsStore.getState().settings;

  if (character.aiProvider === 'openai-compatible' || character.aiProvider === 'local') {
    const url = character.customApiUrl || settings.customApiUrl;
    const key = settings.customApiKey;
    if (!url || !key) throw new Error('Custom API URL or key not configured in Settings');
    return new OpenAIProvider(key, url);
  }

  // Default: openai
  if (!settings.apiKey) throw new Error('OpenAI API key not configured. Go to Settings.');
  return new OpenAIProvider(settings.apiKey);
}

export const useAIStore = create<AIState>((set, get) => ({
  isStreaming: false,
  abortController: null,
  error: null,

  sendMessage: async (character: Character, text: string) => {
    const chatStore = useChatStore.getState();
    let chat = chatStore.currentChat;

    if (!chat) {
      chat = await chatStore.createChat(character.id);
      await chatStore.openChat(chat.id);
    }

    const userMessage: Message = {
      id: crypto.randomUUID(),
      chatId: chat.id,
      role: 'user',
      content: text,
      timestamp: new Date().toISOString()
    };
    await chatStore.addMessage(userMessage);

    const messages = chatStore.messages;
    let summary: ChatSummary | undefined;

    if (needsSummary(messages.length)) {
      try {
        const provider = getProvider(character);
        const oldMessages = messages.slice(0, -MAX_RECENT_MESSAGES);
        summary = await provider.summarizeConversation(oldMessages);
        await db.cache.put({ key: `summary:${chat.id}`, value: summary, expiresAt: Date.now() + 86400000 } as any);
      } catch {
        // Continue without summary
      }
    }

    const contextMessages = buildChatContext(character, messages, text, summary);

    const abortController = new AbortController();
    set({ isStreaming: true, abortController, error: null });

    const assistantMessageId = crypto.randomUUID();
    let streamedContent = '';

    try {
      const provider = getProvider(character);
      const response = await provider.sendMessage(
        contextMessages,
        character,
        (chunk) => {
          streamedContent += chunk;
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

      const assistantMessage: Message = {
        id: assistantMessageId,
        chatId: chat.id,
        role: 'assistant',
        content: response.content,
        timestamp: new Date().toISOString(),
        mood: response.mood,
        actions: response.actions,
        tokenCount: response.tokenUsage?.total
      };
      await chatStore.addMessage(assistantMessage);

      // Track tokens
      if (response.tokenUsage) {
        await useTokenStore.getState().addUsage({
          chatId: chat.id,
          characterId: character.id,
          model: character.model,
          promptTokens: response.tokenUsage.prompt,
          completionTokens: response.tokenUsage.completion,
          totalTokens: response.tokenUsage.total,
          timestamp: new Date().toISOString(),
          date: new Date().toISOString().slice(0, 10)
        });
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        if (streamedContent) {
          await chatStore.addMessage({
            id: assistantMessageId,
            chatId: chat.id,
            role: 'assistant',
            content: streamedContent,
            timestamp: new Date().toISOString()
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
    if (abortController) abortController.abort();
  },

  clearError: () => set({ error: null }),

  generateCharacter: async (description: string) => {
    const settings = useSettingsStore.getState().settings;
    if (!settings.apiKey) throw new Error('No API key');
    const provider = new OpenAIProvider(settings.apiKey);
    return provider.generateCharacter(description);
  }
}));
