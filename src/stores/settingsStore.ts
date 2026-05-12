import { create } from 'zustand';
import type { AppSettings } from '../types';
import { defaultSettings } from '../types';
import { db } from '../db';

interface SettingsState {
  settings: AppSettings;
  loadSettings: () => Promise<void>;
  updateSettings: (partial: Partial<AppSettings>) => Promise<void>;
  setTheme: (theme: 'dark' | 'light') => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: { ...defaultSettings },

  loadSettings: async () => {
    const entries = await db.settings.toArray();
    const merged: Partial<AppSettings> = {};
    for (const entry of entries) {
      (merged as any)[entry.key] = entry.value;
    }
    set({ settings: { ...defaultSettings, ...merged } });
  },

  updateSettings: async (partial: Partial<AppSettings>) => {
    const current = get().settings;
    const updated = { ...current, ...partial };
    for (const [key, value] of Object.entries(partial)) {
      const existing = await db.settings.get(key);
      if (existing) {
        await db.settings.update(key, { value });
      } else {
        await db.settings.add({ key, value });
      }
    }
    set({ settings: updated });
  },

  setTheme: async (theme: 'dark' | 'light') => {
    await get().updateSettings({ theme });
    document.documentElement.setAttribute('data-theme', theme);
  }
}));
