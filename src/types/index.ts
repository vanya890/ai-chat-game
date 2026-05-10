// AI Response JSON Schema
export interface AIResponse {
  content: string;
  done: boolean;
  mood?: 'neutral' | 'happy' | 'sad' | 'angry' | 'surprised' | 'thoughtful' | 'playful' | 'serious' | 'confident';
  actions?: Action[];
  metadata?: ResponseMetadata;
}

export interface Action {
  type: 'suggestion' | 'question' | 'command' | 'link' | 'image';
  label: string;
  payload: string;
}

export interface ResponseMetadata {
  tokenCount?: number;
  responseTime?: number;
  model?: string;
}

// Character
export interface Character {
  id: string;
  name: string;
  avatar: string;
  description: string;
  personality: string;
  systemPrompt: string;
  greeting: string;
  aiProvider: string;
  model: string;
  temperature: number;
  maxTokens: number;
  tags: string[];
  isUserCreated: boolean;
  createdAt: string;
  updatedAt: string;
}

// Chat
export interface Chat {
  id: string;
  characterId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messageCount: number;
  lastMessagePreview: string;
  isPinned: boolean;
}

// Message
export interface Message {
  id: string;
  chatId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  tokenCount?: number;
  mood?: string;
  actions?: Action[];
}

// Settings
export interface AppSettings {
  apiKey: string;
  defaultModel: string;
  theme: 'light' | 'dark' | 'system';
  language: string;
  defaultTemperature: number;
  maxHistoryLength: number;
}

// AI Provider
export interface AIProviderConfig {
  name: string;
  baseUrl: string;
  apiKeyEnv: string;
  models: Record<string, ModelConfig>;
}

export interface ModelConfig {
  name: string;
  maxTokens: number;
  costPer1kTokens: number;
}

// Chat Summary
export interface ChatSummary {
  summary: string;
  keyPoints: string[];
  characterState: string;
  tokenCount: number;
}

// Message Classification
export interface MessageClassification {
  complexity: 'simple' | 'moderate' | 'complex';
  intent: 'greeting' | 'question' | 'statement' | 'command' | 'creative';
  estimatedTokens: number;
  suggestedModel: string;
  suggestedMaxTokens: number;
}
