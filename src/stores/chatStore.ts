import { create } from 'zustand'
import type { Message, Chat, Character, AIResponse } from '../types'
import { getChat, getMessages, addMessage, createChat, updateChat, getCharacter } from '../db'
import { OpenAIProvider, estimateComplexity, selectModel, buildChatContext } from '../services/aiProvider'
import { useAppStore } from './appStore'

interface ChatState {
  currentChat: Chat | null
  messages: Message[]
  loading: boolean
  streaming: boolean
  streamingContent: string
  abortController: AbortController | null
  error: string | null

  loadChat: (chatId: string) => Promise<void>
  sendMessage: (chatId: string, characterId: string, content: string) => Promise<void>
  stopStreaming: () => void
  createNewChat: (characterId: string) => Promise<string>
  clearCurrentChat: () => void
}

const aiProvider = new OpenAIProvider()

export const useChatStore = create<ChatState>((set, get) => ({
  currentChat: null,
  messages: [],
  loading: false,
  streaming: false,
  streamingContent: '',
  abortController: null,
  error: null,

  loadChat: async (chatId: string) => {
    set({ loading: true, error: null })
    try {
      const chat = await getChat(chatId)
      const messages = await getMessages(chatId)
      set({ currentChat: chat || null, messages, loading: false })
    } catch (error) {
      set({ error: 'Не удалось загрузить чат', loading: false })
    }
  },

  createNewChat: async (characterId: string): Promise<string> => {
    const character = await getCharacter(characterId)
    if (!character) throw new Error('Character not found')

    const chatId = crypto.randomUUID()
    const now = new Date().toISOString()
    const chat: Chat = {
      id: chatId,
      characterId,
      title: character.name,
      createdAt: now,
      updatedAt: now,
      messageCount: 0,
      lastMessagePreview: '',
      isPinned: false
    }

    await createChat(chat)
    set({ currentChat: chat, messages: [] })
    return chatId
  },

  sendMessage: async (chatId: string, characterId: string, content: string) => {
    const { messages, currentChat } = get()
    const { settings } = useAppStore.getState()

    if (!settings.apiKey) {
      set({ error: 'Введите API ключ в настройках' })
      return
    }

    const character = await getCharacter(characterId)
    if (!character) return

    // Add user message
    const userMessage: Message = {
      id: crypto.randomUUID(),
      chatId,
      role: 'user',
      content,
      timestamp: new Date().toISOString()
    }

    const updatedMessages = [...messages, userMessage]
    set({ messages: updatedMessages, error: null, streaming: true, streamingContent: '' })

    // Build context
    const contextMessages = buildChatContext(
      messages,
      character.systemPrompt,
      character.greeting,
      content
    )

    // Select model based on complexity
    const complexity = estimateComplexity(content)
    const { model, maxTokens } = selectModel(complexity, settings.defaultModel)

    // Create abort controller
    const abortController = new AbortController()
    set({ abortController })

    try {
      const response = await aiProvider.streamMessage(
        contextMessages,
        {
          model,
          temperature: character.temperature,
          maxTokens,
          systemPrompt: character.systemPrompt,
          apiKey: settings.apiKey,
          baseUrl: settings.apiBaseUrl,
          signal: abortController.signal
        },
        (chunk) => {
          set((state) => ({ streamingContent: state.streamingContent + chunk }))
        }
      )

      // Save assistant message
      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        chatId,
        role: 'assistant',
        content: response.content,
        timestamp: new Date().toISOString(),
        mood: response.mood,
        actions: response.actions
      }

      await addMessage(userMessage)
      await addMessage(assistantMessage)

      // Update chat metadata
      const allMessages = [...updatedMessages, assistantMessage]
      await updateChat(chatId, {
        updatedAt: new Date().toISOString(),
        messageCount: allMessages.length,
        lastMessagePreview: response.content.substring(0, 100)
      })

      set({
        messages: allMessages,
        streaming: false,
        streamingContent: '',
        abortController: null
      })
    } catch (error: any) {
      if (error.name === 'AbortError') {
        set({ streaming: false, streamingContent: '', abortController: null })
        return
      }
      set({
        error: error.message || 'Ошибка при отправке сообщения',
        streaming: false,
        streamingContent: '',
        abortController: null
      })
    }
  },

  stopStreaming: () => {
    const { abortController } = get()
    if (abortController) {
      abortController.abort()
    }
  },

  clearCurrentChat: () => {
    set({ currentChat: null, messages: [], error: null, streaming: false, streamingContent: '' })
  }
}))
