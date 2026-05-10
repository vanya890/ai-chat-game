import { create } from 'zustand';
import type { AppSettings } from '../types';
import { db } from '../db';

interface SettingsState {
  settings: AppSettings;
  isLoading: boolean;
  loadSettings: () => Promise<void>;
  updateSettings: (updates: Partial<AppSettings>) => Promise<void>;
  setApiKey: (key: string) => Promise<void>;
  setTheme: (theme: 'light' | 'dark' | 'system') => Promise<void>;
}

const defaultSettings: AppSettings = {
  apiKey: '',
  defaultModel: 'gpt-4o-mini',
  theme: 'dark',
  language: 'ru',
  defaultTemperature: 0.7,
  maxHistoryLength: 20
};

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: defaultSettings,
  isLoading: true,

  loadSettings: async () => {
    try {
      const stored = await db.settings.get('app-settings');
      if (stored) {
        set({ settings: { ...defaultSettings, ...stored }, isLoading: false });
      } else {
        await db.settings.put({ key: 'app-settings', ...defaultSettings } as any);
        set({ settings: defaultSettings, isLoading: false });
      }
    } catch {
      set({ settings: defaultSettings, isLoading: false });
    }
  },

  updateSettings: async (updates) => {
    const current = get().settings;
    const updated = { ...current, ...updates };
    await db.settings.put({ key: 'app-settings', ...updated } as any);
    set({ settings: updated });
  },

  setApiKey: async (key) => {
    await get().updateSettings({ apiKey: key });
  },

  setTheme: async (theme) => {
    await get().updateSettings({ theme });
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }
}));
