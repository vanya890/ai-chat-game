import Dexie, { type Table } from 'dexie';
import type { Character, Chat, Message, AppSettings } from '../types';

export class ChatDB extends Dexie {
  characters!: Table<Character, string>;
  chats!: Table<Chat, string>;
  messages!: Table<Message, number>;
  settings!: Table<AppSettings, string>;
  cache!: Table<{ key: string; value: unknown; expiresAt: number }, string>;

  constructor() {
    super('ai-chat-game');
    this.version(1).stores({
      characters: 'id, name, *tags, isUserCreated, updatedAt',
      chats: 'id, characterId, updatedAt, isPinned',
      messages: '++id, chatId, timestamp',
      settings: 'key',
      cache: 'key, expiresAt'
    });
  }
}

export const db = new ChatDB();
