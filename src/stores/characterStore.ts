import { create } from 'zustand';
import type { Character } from '../types';
import { db } from '../db';
import detectiveConfig from '../../config/characters/detective.json';
import wizardConfig from '../../config/characters/wizard.json';

interface CharacterState {
  characters: Character[];
  isLoading: boolean;
  loadCharacters: () => Promise<void>;
  getCharacter: (id: string) => Character | undefined;
  addCharacter: (character: Character) => Promise<void>;
  updateCharacter: (id: string, updates: Partial<Character>) => Promise<void>;
  deleteCharacter: (id: string) => Promise<void>;
  searchCharacters: (query: string) => Character[];
  filterByTags: (tags: string[]) => Character[];
}

const defaultCharacters: Character[] = [
  {
    id: detectiveConfig.id,
    name: detectiveConfig.name,
    avatar: detectiveConfig.avatar,
    description: detectiveConfig.description,
    personality: detectiveConfig.personality,
    systemPrompt: detectiveConfig.systemPrompt,
    greeting: detectiveConfig.greeting,
    aiProvider: detectiveConfig.aiProvider || 'openai',
    model: detectiveConfig.model || 'gpt-4o-mini',
    temperature: detectiveConfig.temperature ?? 0.5,
    maxTokens: detectiveConfig.maxTokens ?? 300,
    tags: detectiveConfig.tags,
    isUserCreated: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: wizardConfig.id,
    name: wizardConfig.name,
    avatar: wizardConfig.avatar,
    description: wizardConfig.description,
    personality: wizardConfig.personality,
    systemPrompt: wizardConfig.systemPrompt,
    greeting: wizardConfig.greeting,
    aiProvider: wizardConfig.aiProvider || 'openai',
    model: wizardConfig.model || 'gpt-4o-mini',
    temperature: wizardConfig.temperature ?? 0.7,
    maxTokens: wizardConfig.maxTokens ?? 400,
    tags: wizardConfig.tags,
    isUserCreated: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export const useCharacterStore = create<CharacterState>((set, get) => ({
  characters: [],
  isLoading: true,

  loadCharacters: async () => {
    try {
      const stored = await db.characters.toArray();
      if (stored.length === 0) {
        await db.characters.bulkAdd(defaultCharacters);
        set({ characters: defaultCharacters, isLoading: false });
      } else {
        // Merge: add defaults for any missing built-in characters
        const storedIds = new Set(stored.map(c => c.id));
        const missing = defaultCharacters.filter(c => !storedIds.has(c.id));
        if (missing.length > 0) {
          await db.characters.bulkAdd(missing);
        }
        const all = await db.characters.toArray();
        set({ characters: all, isLoading: false });
      }
    } catch (error) {
      console.error('Failed to load characters:', error);
      set({ characters: defaultCharacters, isLoading: false });
    }
  },

  getCharacter: (id) => {
    return get().characters.find(c => c.id === id);
  },

  addCharacter: async (character) => {
    await db.characters.add(character);
    set({ characters: [...get().characters, character] });
  },

  updateCharacter: async (id, updates) => {
    await db.characters.update(id, { ...updates, updatedAt: new Date().toISOString() });
    set({
      characters: get().characters.map(c =>
        c.id === id ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c
      )
    });
  },

  deleteCharacter: async (id) => {
    await db.characters.delete(id);
    set({ characters: get().characters.filter(c => c.id !== id) });
  },

  searchCharacters: (query) => {
    const q = query.toLowerCase();
    return get().characters.filter(c =>
      c.name.toLowerCase().includes(q) ||
      c.description.toLowerCase().includes(q) ||
      c.tags.some(t => t.toLowerCase().includes(q))
    );
  },

  filterByTags: (tags) => {
    if (tags.length === 0) return get().characters;
    return get().characters.filter(c =>
      tags.some(t => c.tags.includes(t))
    );
  }
}));
