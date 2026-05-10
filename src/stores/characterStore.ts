import { create } from 'zustand'
import type { Character } from '../types'
import { getCharacters, saveCharacter, deleteCharacter } from '../db'

interface CharacterStore {
  characters: Character[]
  loading: boolean
  searchQuery: string
  selectedTags: string[]
  loadCharacters: () => Promise<void>
  addCharacter: (character: Character) => Promise<void>
  updateCharacter: (character: Character) => Promise<void>
  removeCharacter: (id: string) => Promise<void>
  setSearchQuery: (query: string) => void
  toggleTag: (tag: string) => void
  filteredCharacters: () => Character[]
  getAllTags: () => string[]
}

export const useCharacterStore = create<CharacterStore>((set, get) => ({
  characters: [],
  loading: false,
  searchQuery: '',
  selectedTags: [],

  loadCharacters: async () => {
    set({ loading: true })
    try {
      const characters = await getCharacters()
      set({ characters, loading: false })
    } catch (error) {
      console.error('Failed to load characters:', error)
      set({ loading: false })
    }
  },

  addCharacter: async (character) => {
    await saveCharacter(character)
    set((state) => ({ characters: [...state.characters, character] }))
  },

  updateCharacter: async (character) => {
    await saveCharacter({ ...character, updatedAt: new Date().toISOString() })
    set((state) => ({
      characters: state.characters.map(c => c.id === character.id ? character : c)
    }))
  },

  removeCharacter: async (id) => {
    await deleteCharacter(id)
    set((state) => ({ characters: state.characters.filter(c => c.id !== id) }))
  },

  setSearchQuery: (query) => set({ searchQuery: query }),

  toggleTag: (tag) => set((state) => ({
    selectedTags: state.selectedTags.includes(tag)
      ? state.selectedTags.filter(t => t !== tag)
      : [...state.selectedTags, tag]
  })),

  filteredCharacters: () => {
    const { characters, searchQuery, selectedTags } = get()
    let filtered = characters

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(c =>
        c.name.toLowerCase().includes(query) ||
        c.description.toLowerCase().includes(query) ||
        c.tags.some(t => t.toLowerCase().includes(query))
      )
    }

    if (selectedTags.length > 0) {
      filtered = filtered.filter(c =>
        selectedTags.some(tag => c.tags.includes(tag))
      )
    }

    return filtered
  },

  getAllTags: () => {
    const tags = new Set<string>()
    get().characters.forEach(c => c.tags.forEach(t => tags.add(t)))
    return Array.from(tags).sort()
  }
}))
