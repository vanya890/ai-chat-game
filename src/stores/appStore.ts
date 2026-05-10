import { create } from 'zustand'
import type { AppSettings } from '../types'
import { getSettings, saveSettings } from '../db'

interface AppStore {
  initialized: boolean
  settings: Partial<AppSettings>
  theme: 'light' | 'dark'
  init: () => Promise<void>
  updateSettings: (settings: Partial<AppSettings>) => Promise<void>
  setTheme: (theme: 'light' | 'dark') => void
}

export const useAppStore = create<AppStore>((set) => ({
  initialized: false,
  settings: {},
  theme: 'dark',

  init: async () => {
    const settings = await getSettings()
    const theme = settings.theme === 'system'
      ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
      : (settings.theme || 'dark')

    document.documentElement.classList.toggle('dark', theme === 'dark')

    set({ initialized: true, settings, theme })
  },

  updateSettings: async (newSettings) => {
    await saveSettings(newSettings)
    set((state) => ({ settings: { ...state.settings, ...newSettings } }))
  },

  setTheme: (theme) => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    set({ theme })
  }
}))
