import { create } from 'zustand';
import type { Chat, Message } from '../types';
import { db } from '../db';
import { nanoid } from 'nanoid';

interface ChatState {
  chats: Chat[];
  currentChat: Chat | null;
  messages: Message[];
  isLoading: boolean;
  isSending: boolean;
  loadChats: () => Promise<void>;
  createChat: (characterId: string) => Promise<Chat>;
  openChat: (chatId: string) => Promise<void>;
  deleteChat: (chatId: string) => Promise<void>;
  renameChat: (chatId: string, title: string) => Promise<void>;
  togglePinChat: (chatId: string) => Promise<void>;
  addMessage: (message: Message) => Promise<void>;
  setCurrentChat: (chat: Chat | null) => void;
  setMessages: (messages: Message[]) => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  chats: [],
  currentChat: null,
  messages: [],
  isLoading: false,
  isSending: false,

  loadChats: async () => {
    const chats = await db.chats.orderBy('updatedAt').reverse().toArray();
    set({ chats });
  },

  createChat: async (characterId) => {
    const chat: Chat = {
      id: nanoid(),
      characterId,
      title: 'Новый чат',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messageCount: 0,
      lastMessagePreview: '',
      isPinned: false
    };
    await db.chats.add(chat);
    set({ chats: [chat, ...get().chats] });
    return chat;
  },

  openChat: async (chatId) => {
    const chat = get().chats.find(c => c.id === chatId);
    if (!chat) return;

    set({ isLoading: true });
    const messages = await db.messages
      .where('chatId')
      .equals(chatId)
      .sortBy('timestamp');

    set({ currentChat: chat, messages, isLoading: false });
  },

  deleteChat: async (chatId) => {
    await db.messages.where('chatId').equals(chatId).delete();
    await db.chats.delete(chatId);
    const current = get().currentChat;
    if (current?.id === chatId) {
      set({ currentChat: null, messages: [] });
    }
    set({ chats: get().chats.filter(c => c.id !== chatId) });
  },

  renameChat: async (chatId, title) => {
    await db.chats.update(chatId, { title });
    set({
      chats: get().chats.map(c => c.id === chatId ? { ...c, title } : c)
    });
  },

  togglePinChat: async (chatId) => {
    const chat = get().chats.find(c => c.id === chatId);
    if (!chat) return;
    const isPinned = !chat.isPinned;
    await db.chats.update(chatId, { isPinned });
    set({
      chats: get().chats.map(c => c.id === chatId ? { ...c, isPinned } : c)
        .sort((a, b) => {
          if (a.isPinned && !b.isPinned) return -1;
          if (!a.isPinned && b.isPinned) return 1;
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        })
    });
  },

  addMessage: async (message) => {
    await db.messages.add(message);

    // Update chat metadata
    const chatId = message.chatId;
    const chat = get().chats.find(c => c.id === chatId);
    if (chat) {
      const updates = {
        messageCount: chat.messageCount + 1,
        lastMessagePreview: message.content.substring(0, 100),
        updatedAt: new Date().toISOString()
      };
      await db.chats.update(chatId, updates);
      set({
        chats: get().chats.map(c => c.id === chatId ? { ...c, ...updates } : c)
          .sort((a, b) => {
            if (a.isPinned && !b.isPinned) return -1;
            if (!a.isPinned && b.isPinned) return 1;
            return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
          })
      });
    }

    // Add to current messages if this is the active chat
    if (get().currentChat?.id === chatId) {
      set({ messages: [...get().messages, message] });
    }
  },

  setCurrentChat: (chat) => set({ currentChat: chat }),
  setMessages: (messages) => set({ messages })
}));
