import { create } from 'zustand';
import type { Chat, Message } from '../types';
import { db } from '../db';

interface ChatState {
  chats: Chat[];
  messages: Message[];
  currentChat: Chat | null;
  loadChats: () => Promise<void>;
  createChat: (characterId: string) => Promise<Chat>;
  openChat: (chatId: string) => Promise<void>;
  addMessage: (message: Message) => Promise<void>;
  setMessages: (messages: Message[]) => void;
  deleteChat: (chatId: string) => Promise<void>;
  pinChat: (chatId: string) => Promise<void>;
}

export const useChatStore = create<ChatState>((set, get) => ({
  chats: [],
  messages: [],
  currentChat: null,

  loadChats: async () => {
    const chats = await db.chats.orderBy('updatedAt').reverse().toArray();
    set({ chats });
  },

  createChat: async (characterId: string) => {
    const chat: Chat = {
      id: crypto.randomUUID(),
      characterId,
      title: `Чат с персонажем`,
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

  openChat: async (chatId: string) => {
    const chat = await db.chats.get(chatId);
    if (!chat) return;
    const messages = await db.messages.where('chatId').equals(chatId).sortBy('timestamp');
    set({ currentChat: chat, messages });
  },

  addMessage: async (message: Message) => {
    await db.messages.add(message);
    const messages = [...get().messages, message];
    const currentChat = get().currentChat;

    if (currentChat) {
      const updatedChat = {
        ...currentChat,
        messageCount: currentChat.messageCount + 1,
        lastMessagePreview: message.content.slice(0, 100),
        updatedAt: message.timestamp
      };
      await db.chats.update(currentChat.id, {
        messageCount: updatedChat.messageCount,
        lastMessagePreview: updatedChat.lastMessagePreview,
        updatedAt: updatedChat.updatedAt
      });
      set({ messages, currentChat: updatedChat });
    } else {
      set({ messages });
    }
  },

  setMessages: (messages: Message[]) => {
    set({ messages });
  },

  deleteChat: async (chatId: string) => {
    await db.messages.where('chatId').equals(chatId).delete();
    await db.chats.delete(chatId);
    set({
      chats: get().chats.filter(c => c.id !== chatId),
      currentChat: get().currentChat?.id === chatId ? null : get().currentChat,
      messages: get().currentChat?.id === chatId ? [] : get().messages
    });
  },

  pinChat: async (chatId: string) => {
    const chat = get().chats.find(c => c.id === chatId);
    if (!chat) return;
    const updated = { ...chat, isPinned: !chat.isPinned };
    await db.chats.update(chatId, { isPinned: updated.isPinned });
    set({ chats: get().chats.map(c => c.id === chatId ? updated : c) });
  }
}));
