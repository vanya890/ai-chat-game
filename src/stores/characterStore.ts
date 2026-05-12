import { create } from 'zustand';
import type { Character } from '../types';
import { db } from '../db';

const defaultCharacters: Character[] = [
  {
    id: 'sherlock',
    name: 'Шерлок Холмс',
    avatar: '🔍',
    avatarType: 'emoji',
    description: 'Блестящий детектив, аналитический ум, сухой юмор',
    personality: 'analytical, observant, dry humor',
    systemPrompt: 'You are Sherlock Holmes, a brilliant detective in 1890s London. You are analytical, observant, and have a dry sense of humor. You speak precisely and value logic over emotions. You often notice details others miss. Always stay in character. Keep responses concise (100-200 words). Never break character.',
    greeting: 'Ах, новый посетитель. Проходите. Я как раз размышлял над одним любопытным делом...',
    aiProvider: 'openai',
    customApiUrl: '',
    model: 'gpt-4o-mini',
    temperature: 0.5,
    maxTokens: 300,
    tags: ['detective', 'mystery', 'logic'],
    isUserCreated: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'merlin',
    name: 'Мерлин',
    avatar: '🧙',
    avatarType: 'emoji',
    description: 'Мудрый и загадочный волшебник из Камелота',
    personality: 'wise, mysterious, advisor',
    systemPrompt: 'You are Merlin, a wise and mysterious wizard from Camelot. You speak in a calm, deep voice and often use metaphors related to nature and magic. You are patient and encouraging, but always hint at deeper secrets. Keep responses concise (100-200 words). Never break character.',
    greeting: 'Приветствую тебя, путник. Я ждал твоего прихода... Звёзды шептали о твоём визите.',
    aiProvider: 'openai',
    customApiUrl: '',
    model: 'gpt-4o-mini',
    temperature: 0.7,
    maxTokens: 300,
    tags: ['wizard', 'fantasy', 'wisdom'],
    isUserCreated: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'cat',
    name: 'Кот-философ',
    avatar: '🐱',
    avatarType: 'emoji',
    description: 'Саркастичный кот, который даёт жизненные советы',
    personality: 'sarcastic, wise, life advice',
    systemPrompt: 'You are a sarcastic cat who sits on a windowsill and gives life advice. You are bluntly honest but have a sharp wit. You often make observations about human behavior and give unexpected but wise insights. You speak in a casual, conversational tone. Keep responses concise (80-150 words). Never break character.',
    greeting: 'Мяу. Опять человек с проблемами? Ладно, выкладывай. У меня как раз есть время между снами.',
    aiProvider: 'openai',
    customApiUrl: '',
    model: 'gpt-4o-mini',
    temperature: 0.8,
    maxTokens: 250,
    tags: ['cat', 'philosophy', 'humor'],
    isUserCreated: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

interface CharacterState {
  characters: Character[];
  loadCharacters: () => Promise<void>;
  addCharacter: (character: Character) => Promise<void>;
  updateCharacter: (id: string, character: Character) => Promise<void>;
  deleteCharacter: (id: string) => Promise<void>;
  searchCharacters: (query: string) => Character[];
  filterByTags: (tags: string[]) => Character[];
}

export const useCharacterStore = create<CharacterState>((set, get) => ({
  characters: [],

  loadCharacters: async () => {
    const stored = await db.characters.toArray();
    if (stored.length === 0) {
      await db.characters.bulkAdd(defaultCharacters);
      set({ characters: defaultCharacters });
    } else {
      const all = [...defaultCharacters.filter(c => !c.isUserCreated), ...stored.filter(c => c.isUserCreated)];
      set({ characters: all });
    }
  },

  addCharacter: async (character: Character) => {
    await db.characters.add(character);
    set({ characters: [...get().characters, character] });
  },

  updateCharacter: async (id: string, character: Character) => {
    await db.characters.update(id, character);
    set({
      characters: get().characters.map(c => c.id === id ? character : c)
    });
  },

  deleteCharacter: async (id: string) => {
    await db.characters.delete(id);
    set({ characters: get().characters.filter(c => c.id !== id) });
  },

  searchCharacters: (query: string) => {
    const q = query.toLowerCase();
    return get().characters.filter(c =>
      c.name.toLowerCase().includes(q) ||
      c.description.toLowerCase().includes(q) ||
      c.tags.some(t => t.toLowerCase().includes(q))
    );
  },

  filterByTags: (tags: string[]) => {
    return get().characters.filter(c =>
      tags.some(t => c.tags.includes(t))
    );
  }
}));
