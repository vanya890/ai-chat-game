export interface Character {
  id: string;
  name: string;
  avatar: string; // emoji or URL
  avatarType: 'emoji' | 'url' | 'generated';
  description: string;
  personality: string;
  systemPrompt: string;
  greeting: string;
  aiProvider: 'openai' | 'openai-compatible' | 'local' | 'anthropic' | 'google';
  customApiUrl: string; // for openai-compatible / local
  model: string;
  temperature: number;
  maxTokens: number;
  tags: string[];
  isUserCreated: boolean;
  createdAt: string;
  updatedAt: string;
}

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

export interface Message {
  id: string;
  chatId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  imageUrl?: string; // for image messages
  timestamp: string;
  tokenCount?: number;
  mood?: string;
  actions?: Array<{ label: string; payload: string }>;
}

export interface AIResponse {
  content: string;
  done: boolean;
  mood?: string;
  actions?: Array<{ label: string; payload: string }>;
  imageUrl?: string;
  tokenUsage?: { prompt: number; completion: number; total: number };
}

export interface ChatSummary {
  summary: string;
  keyPoints: string[];
  characterState: string;
}

export interface TokenUsage {
  id: string;
  chatId: string;
  characterId: string;
  model: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  timestamp: string;
  date: string; // YYYY-MM-DD for grouping
}

export interface AppSettings {
  // OpenAI
  apiKey: string;
  defaultModel: string;
  defaultTemperature: number;
  maxHistoryLength: number;

  // Custom provider
  customApiUrl: string;
  customApiKey: string;
  customModel: string;

  // Image generation
  imageProvider: 'none' | 'dalle' | 'comfyui';
  dalleApiKey: string;
  comfyUiUrl: string; // e.g. http://127.0.0.1:8188
  comfyUiPositivePrompt: string;
  comfyUiNegativePrompt: string;
  comfyUiModel: string;
  imageWidth: number;
  imageHeight: number;
  imageSteps: number;

  // UI
  theme: 'dark' | 'light';
}

export const defaultSettings: AppSettings = {
  apiKey: '',
  defaultModel: 'gpt-4o-mini',
  defaultTemperature: 0.7,
  maxHistoryLength: 20,
  customApiUrl: '',
  customApiKey: '',
  customModel: '',
  imageProvider: 'none',
  dalleApiKey: '',
  comfyUiUrl: 'http://127.0.0.1:8188',
  comfyUiPositivePrompt: 'high quality, detailed',
  comfyUiNegativePrompt: 'low quality, blurry',
  comfyUiModel: 'v1-5-pruned-emaonly.safetensors',
  imageWidth: 512,
  imageHeight: 512,
  imageSteps: 20,
  theme: 'dark'
};
