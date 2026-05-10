import Dexie, { type Table } from 'dexie'
import type { Character, Chat, Message, AppSettings } from '../types'

export class ChatDB extends Dexie {
  characters!: Table<Character>
  chats!: Table<Chat>
  messages!: Table<Message>
  settings!: Table<{ key: string } & Partial<AppSettings>>
  cache!: Table<{ key: string; value: unknown; expiresAt: number }>

  constructor() {
    super('ai-chat-game')
    this.version(1).stores({
      characters: 'id, name, *tags, isUserCreated, updatedAt',
      chats: 'id, characterId, updatedAt, isPinned',
      messages: '++id, chatId, timestamp',
      settings: 'key',
      cache: 'key, expiresAt'
    })
  }
}

export const db = new ChatDB()

// Helper functions
export async function getCharacters(): Promise<Character[]> {
  return db.characters.orderBy('name').toArray()
}

export async function getCharacter(id: string): Promise<Character | undefined> {
  return db.characters.get(id)
}

export async function saveCharacter(character: Character): Promise<void> {
  await db.characters.put(character)
}

export async function deleteCharacter(id: string): Promise<void> {
  await db.characters.delete(id)
}

export async function getChats(): Promise<Chat[]> {
  return db.chats.orderBy('updatedAt').reverse().toArray()
}

export async function getChat(id: string): Promise<Chat | undefined> {
  return db.chats.get(id)
}

export async function createChat(chat: Chat): Promise<string> {
  await db.chats.add(chat)
  return chat.id
}

export async function updateChat(id: string, updates: Partial<Chat>): Promise<void> {
  await db.chats.update(id, updates)
}

export async function deleteChat(id: string): Promise<void> {
  await db.chats.delete(id)
  await db.messages.where('chatId').equals(id).delete()
}

export async function getMessages(chatId: string): Promise<Message[]> {
  return db.messages.where('chatId').equals(chatId).sortBy('timestamp')
}

export async function addMessage(message: Message): Promise<number> {
  return db.messages.add(message)
}

export async function addMessages(messages: Message[]): Promise<number[]> {
  return db.messages.bulkAdd(messages)
}

export async function deleteMessage(id: number): Promise<void> {
  await db.messages.delete(id)
}

export async function getSettings(): Promise<Partial<AppSettings>> {
  const result = await db.settings.get('app-settings')
  return result || {}
}

export async function saveSettings(settings: Partial<AppSettings>): Promise<void> {
  await db.settings.put({ key: 'app-settings', ...settings })
}

export async function getCachedResponse(key: string): Promise<unknown | undefined> {
  const entry = await db.cache.get(key)
  if (entry && entry.expiresAt > Date.now()) {
    return entry.value
  }
  if (entry) {
    await db.cache.delete(key)
  }
  return undefined
}

export async function setCache(key: string, value: unknown, ttlMs: number = 3600000): Promise<void> {
  await db.cache.put({ key, value, expiresAt: Date.now() + ttlMs })
}
