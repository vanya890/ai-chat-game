import Dexie, { type Table } from 'dexie';
import type { Character, Chat, Message, TokenUsage } from '../types';

interface CacheEntry {
  key: string;
  value: any;
  expiresAt: number;
}

interface SettingsEntry {
  key: string;
  value: any;
}

export class AppDB extends Dexie {
  characters!: Table<Character>;
  chats!: Table<Chat>;
  messages!: Table<Message>;
  settings!: Table<SettingsEntry>;
  cache!: Table<CacheEntry>;
  tokenUsage!: Table<TokenUsage>;

  constructor() {
    super('ai-chat-game-db');
    this.version(1).stores({
      characters: 'id, name, *tags, isUserCreated',
      chats: 'id, characterId, isPinned, updatedAt',
      messages: 'id, chatId, role, timestamp',
      settings: 'key',
      cache: 'key, expiresAt'
    });
    this.version(2).stores({
      tokenUsage: 'id, chatId, characterId, model, date, timestamp'
    });
  }
}

export const db = new AppDB();
