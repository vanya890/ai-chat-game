import OpenAI from 'openai'
import type { AIProvider, AIResponse, Message, SendMessageConfig, Action, Mood } from '../types'
import { z } from 'zod'

// JSON Schema for AI responses
const AI_RESPONSE_SCHEMA = {
  type: 'object',
  properties: {
    content: { type: 'string', description: 'The main response text' },
    done: { type: 'boolean', description: 'True if response is complete' },
    mood: {
      type: 'string',
      enum: ['neutral', 'happy', 'sad', 'angry', 'surprised', 'thoughtful', 'playful', 'serious'],
      description: "Character's emotional state"
    },
    actions: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          type: { type: 'string', enum: ['suggestion', 'question', 'command', 'link', 'image'] },
          label: { type: 'string' },
          payload: { type: 'string' }
        },
        required: ['type', 'label', 'payload']
      },
      description: 'Suggested user actions'
    }
  },
  required: ['content', 'done'],
  additionalProperties: false
} as const

const AIResponseSchema = z.object({
  content: z.string().min(1),
  done: z.boolean(),
  mood: z.enum(['neutral', 'happy', 'sad', 'angry', 'surprised', 'thoughtful', 'playful', 'serious']).optional(),
  actions: z.array(z.object({
    type: z.enum(['suggestion', 'question', 'command', 'link', 'image']),
    label: z.string(),
    payload: z.string()
  })).max(5).optional()
})

export class OpenAIProvider implements AIProvider {
  private buildMessages(messages: Message[], config: SendMessageConfig): Array<{ role: string; content: string }> {
    return [
      { role: 'system', content: config.systemPrompt },
      ...messages.map(m => ({ role: m.role, content: m.content }))
    ]
  }

  async sendMessage(messages: Message[], config: SendMessageConfig): Promise<AIResponse> {
    const openai = new OpenAI({
      apiKey: config.apiKey,
      baseURL: config.baseUrl,
      dangerouslyAllowBrowser: true
    })

    const apiMessages = this.buildMessages(messages, config)

    const response = await openai.chat.completions.create({
      model: config.model,
      messages: apiMessages,
      max_tokens: config.maxTokens,
      temperature: config.temperature,
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'AIResponse',
          schema: AI_RESPONSE_SCHEMA as any,
          strict: true
        }
      }
    })

    const raw = response.choices[0].message.content
    if (!raw) throw new Error('Empty response from AI')

    const parsed = JSON.parse(raw)
    const validated = AIResponseSchema.parse(parsed)

    return {
      content: validated.content,
      done: true,
      mood: validated.mood,
      actions: validated.actions,
      metadata: {
        tokenCount: response.usage?.total_tokens,
        model: config.model
      }
    }
  }

  async streamMessage(
    messages: Message[],
    config: SendMessageConfig,
    onChunk: (text: string) => void
  ): Promise<AIResponse> {
    const openai = new OpenAI({
      apiKey: config.apiKey,
      baseURL: config.baseUrl,
      dangerouslyAllowBrowser: true
    })

    const apiMessages = this.buildMessages(messages, config)

    const stream = await openai.chat.completions.create({
      model: config.model,
      messages: apiMessages,
      max_tokens: config.maxTokens,
      temperature: config.temperature,
      stream: true,
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'AIResponse',
          schema: AI_RESPONSE_SCHEMA as any,
          strict: true
        }
      }
    })

    let fullContent = ''
    let rawJson = ''

    for await (const chunk of stream) {
      if (config.signal?.aborted) break

      const delta = chunk.choices[0]?.delta?.content || ''
      rawJson += delta

      // Extract content from streaming JSON
      try {
        const match = rawJson.match(/"content"\s*:\s*"((?:[^"\\]|\\.)*)"/)
        if (match) {
          const extracted = match[1].replace(/\\n/g, '\n').replace(/\\"/g, '"')
          if (extracted.length > fullContent.length) {
            fullContent = extracted
            onChunk(extracted)
          }
        }
      } catch {
        // JSON not complete yet, skip
      }
    }

    // Parse full JSON for metadata
    try {
      const parsed = JSON.parse(rawJson)
      const validated = AIResponseSchema.parse(parsed)
      return {
        content: validated.content || fullContent,
        done: true,
        mood: validated.mood,
        actions: validated.actions
      }
    } catch {
      // Fallback if JSON parsing fails
      return {
        content: fullContent || 'Извини, произошла ошибка при обработке ответа.',
        done: true,
        mood: 'neutral'
      }
    }
  }
}

// Model selection based on message complexity
export function estimateComplexity(message: string): 'simple' | 'moderate' | 'complex' {
  const words = message.split(/\s+/).length
  const questionMarks = (message.match(/\?/g) || []).length

  if (words < 10 && questionMarks <= 1) return 'simple'
  if (words < 50 && questionMarks <= 2) return 'moderate'
  return 'complex'
}

export function selectModel(complexity: string, defaultModel: string = 'gpt-4o-mini'): { model: string; maxTokens: number } {
  switch (complexity) {
    case 'simple':
      return { model: 'gpt-4o-mini', maxTokens: 150 }
    case 'moderate':
      return { model: 'gpt-4o-mini', maxTokens: 300 }
    case 'complex':
      return { model: defaultModel === 'gpt-4o' ? 'gpt-4o' : 'gpt-4o-mini', maxTokens: 600 }
    default:
      return { model: 'gpt-4o-mini', maxTokens: 300 }
  }
}

// Build chat context with sliding window
export function buildChatContext(
  allMessages: Message[],
  systemPrompt: string,
  greeting: string,
  newUserMessage: string
): Message[] {
  const MAX_RECENT = 10
  const recentMessages = allMessages.slice(-MAX_RECENT)

  const contextMessages: Message[] = [
    { id: 'system', chatId: '', role: 'system', content: systemPrompt, timestamp: new Date().toISOString() },
    { id: 'greeting', chatId: '', role: 'assistant', content: greeting, timestamp: new Date().toISOString() },
    ...recentMessages,
    { id: 'new', chatId: '', role: 'user', content: newUserMessage, timestamp: new Date().toISOString() }
  ]

  return contextMessages
}
