// AI Response types
export interface AIResponse {
  content: string
  done: boolean
  mood?: Mood
  actions?: Action[]
  metadata?: ResponseMetadata
}

export type Mood = 'neutral' | 'happy' | 'sad' | 'angry' | 'surprised' | 'thoughtful' | 'playful' | 'serious'

export interface Action {
  type: 'suggestion' | 'question' | 'command' | 'link' | 'image'
  label: string
  payload: string
}

export interface ResponseMetadata {
  tokenCount?: number
  responseTime?: number
  model?: string
}

// Character types
export interface Character {
  id: string
  name: string
  avatar: string
  description: string
  personality: string
  systemPrompt: string
  greeting: string
  aiProvider: string
  model: string
  temperature: number
  maxTokens: number
  tags: string[]
  createdAt: string
  updatedAt: string
  isUserCreated: boolean
}

export interface CharacterConfig {
  id: string
  name: string
  description: string
  personality: string
  systemPrompt: string
  greeting: string
  avatar: string
  tags: string[]
  suggestedModel: string
  temperature: number
}

// Chat types
export interface Chat {
  id: string
  characterId: string
  title: string
  createdAt: string
  updatedAt: string
  messageCount: number
  lastMessagePreview: string
  isPinned: boolean
}

export interface Message {
  id: string
  chatId: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: string
  tokenCount?: number
  mood?: Mood
  actions?: Action[]
}

// Settings types
export interface AppSettings {
  apiKey: string
  defaultModel: string
  theme: 'light' | 'dark' | 'system'
  language: string
  defaultTemperature: number
  maxHistoryLength: number
}

// AI Provider types
export interface AIProviderConfig {
  name: string
  baseUrl: string
  apiKeyEnv: string
  models: Record<string, ModelConfig>
}

export interface ModelConfig {
  name: string
  maxTokens: number
  costPer1kTokens: number
}

export interface AIProvider {
  sendMessage(messages: Message[], config: SendMessageConfig): Promise<AIResponse>
  streamMessage(messages: Message[], config: SendMessageConfig, onChunk: (text: string) => void): Promise<AIResponse>
}

export interface SendMessageConfig {
  model: string
  temperature: number
  maxTokens: number
  systemPrompt: string
  apiKey: string
  baseUrl?: string
  signal?: AbortSignal
}

// Chat context types
export interface ChatContext {
  systemPrompt: string
  greeting: string
  summary?: string
  recentMessages: Message[]
  newUserMessage: string
}

// Complexity types
export type MessageComplexity = 'simple' | 'moderate' | 'complex'

export interface MessageClassification {
  complexity: MessageComplexity
  intent: 'greeting' | 'question' | 'statement' | 'command' | 'creative'
  estimatedTokens: number
  suggestedModel: string
  suggestedMaxTokens: number
}
