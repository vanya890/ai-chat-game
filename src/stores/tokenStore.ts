import { create } from 'zustand';
import type { TokenUsage } from '../types';
import { db } from '../db';

interface TokenState {
  usages: TokenUsage[];
  loadUsages: () => Promise<void>;
  addUsage: (usage: Omit<TokenUsage, 'id'>) => Promise<void>;
  getTotalTokens: () => number;
  getMonthTokens: () => number;
  getTokensPerCharacter: () => Record<string, number>;
  getTokensPerDay: (days: number) => Array<{ date: string; tokens: number }>;
  getAvgPerMessage: () => number;
  getCostEstimate: () => number;
}

const MODEL_PRICES = {
  'gpt-4o-mini': { input: 0.15, output: 0.60 },
  'gpt-4o': { input: 2.50, output: 10.00 }
} as Record<string, { input: number; output: number }>;

export const useTokenStore = create<TokenState>((set, get) => ({
  usages: [],

  loadUsages: async () => {
    const usages = await db.tokenUsage.toArray();
    set({ usages });
  },

  addUsage: async (usage: Omit<TokenUsage, 'id'>) => {
    const entry: TokenUsage = { ...usage, id: crypto.randomUUID() };
    await db.tokenUsage.add(entry);
    set({ usages: [...get().usages, entry] });
  },

  getTotalTokens: () => {
    return get().usages.reduce((sum, u) => sum + u.totalTokens, 0);
  },

  getMonthTokens: () => {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
    return get().usages
      .filter(u => u.date >= monthStart)
      .reduce((sum, u) => sum + u.totalTokens, 0);
  },

  getTokensPerCharacter: () => {
    const map: Record<string, number> = {};
    for (const u of get().usages) {
      map[u.characterId] = (map[u.characterId] || 0) + u.totalTokens;
    }
    return map;
  },

  getTokensPerDay: (days: number) => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    const cutoffStr = cutoff.toISOString().slice(0, 10);
    const dayMap: Record<string, number> = {};
    for (const u of get().usages) {
      if (u.date >= cutoffStr) {
        dayMap[u.date] = (dayMap[u.date] || 0) + u.totalTokens;
      }
    }
    return Object.entries(dayMap)
      .map(([date, tokens]) => ({ date, tokens }))
      .sort((a, b) => a.date.localeCompare(b.date));
  },

  getAvgPerMessage: () => {
    const usages = get().usages;
    if (usages.length === 0) return 0;
    const total = usages.reduce((sum, u) => sum + u.totalTokens, 0);
    return Math.round(total / usages.length);
  },

  getCostEstimate: () => {
    let totalCost = 0;
    for (const u of get().usages) {
      const prices = MODEL_PRICES[u.model] || MODEL_PRICES['gpt-4o-mini'];
      totalCost += (u.promptTokens / 1_000_000) * prices.input;
      totalCost += (u.completionTokens / 1_000_000) * prices.output;
    }
    return totalCost;
  }
}));
