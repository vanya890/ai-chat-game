import type { AIResponse, Character, Message, ChatSummary } from '../types';
import { z } from 'zod';

// Zod schema for AI response validation
export const AIResponseSchema = z.object({
  content: z.string().min(1).max(4000),
  done: z.boolean(),
  mood: z.enum(['neutral', 'happy', 'sad', 'angry', 'surprised', 'thoughtful', 'playful', 'serious', 'confident']).optional(),
  actions: z.array(z.object({
    type: z.enum(['suggestion', 'question', 'command', 'link', 'image']),
    label: z.string(),
    payload: z.string()
  })).max(5).optional(),
  metadata: z.object({
    tokenCount: z.number().optional(),
    responseTime: z.number().optional(),
    model: z.string().optional()
  }).optional()
});

// JSON Schema for OpenAI structured output
export const AI_RESPONSE_JSON_SCHEMA = {
  name: 'AIResponse',
  schema: {
    type: 'object',
    properties: {
      content: { type: 'string', description: 'The main response text from the character' },
      done: { type: 'boolean', description: 'True if response is complete' },
      mood: {
        type: 'string',
        enum: ['neutral', 'happy', 'sad', 'angry', 'surprised', 'thoughtful', 'playful', 'serious', 'confident'],
        description: "Character's emotional state"
      },
      actions: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            type: { type: 'string', enum: ['suggestion', 'question', 'command', 'link', 'image'] },
            label: { type: 'string', description: 'Button text' },
            payload: { type: 'string', description: 'Action data or suggested reply' }
          },
          required: ['type', 'label', 'payload']
        },
        description: 'Suggested user actions (quick replies)'
      }
    },
    required: ['content', 'done'],
    additionalProperties: false
  },
  strict: true
};

export interface AIProvider {
  sendMessage(
    messages: Array<{ role: string; content: string }>,
    character: Character,
    onChunk?: (chunk: string) => void,
    signal?: AbortSignal
  ): Promise<AIResponse>;

  generateCharacter(description: string): Promise<Partial<Character>>;
  summarizeConversation(messages: Message[]): Promise<ChatSummary>;
}

export class OpenAIProvider implements AIProvider {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey: string, baseUrl = 'https://api.openai.com/v1') {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
  }

  async sendMessage(
    messages: Array<{ role: string; content: string }>,
    character: Character,
    onChunk?: (chunk: string) => void,
    signal?: AbortSignal
  ): Promise<AIResponse> {
    const startTime = Date.now();

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model: character.model,
        messages,
        max_tokens: character.maxTokens,
        temperature: character.temperature,
        stream: true,
        response_format: {
          type: 'json_schema',
          json_schema: AI_RESPONSE_JSON_SCHEMA
        }
      }),
      signal
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenAI API error: ${response.status} - ${error}`);
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error('No response body');

    const decoder = new TextDecoder();
    let fullText = '';
    let contentBuffer = '';
    let inContent = false;
    let contentStarted = false;

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        fullText += chunk;

        // Parse SSE lines
        const lines = chunk.split('\n');
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const data = line.slice(6).trim();
          if (data === '[DONE]') continue;

          try {
            const parsed = JSON.parse(data);
            const delta = parsed.choices?.[0]?.delta?.content;
            if (delta) {
              // Extract content from JSON stream
              if (!contentStarted && delta.includes('"content"')) {
                contentStarted = true;
                inContent = true;
                continue;
              }

              if (inContent) {
                // Check if we've left the content field
                if (delta.includes('"') && (delta.includes('"done"') || delta.includes('"mood"') || delta.includes('"actions"'))) {
                  inContent = false;
                  continue;
                }
                const cleaned = delta.replace(/["\\]/g, '');
                contentBuffer += cleaned;
                onChunk?.(cleaned);
              }
            }
          } catch {
            // Skip malformed JSON chunks
          }
        }
      }
    } catch (error) {
      if (signal?.aborted) {
        return {
          content: contentBuffer || 'Ответ отменён.',
          done: false
        };
      }
      throw error;
    }

    // Parse full JSON response
    try {
      const jsonMatch = fullText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        const validated = AIResponseSchema.parse(parsed);
        return {
          ...validated,
          metadata: {
            ...validated.metadata,
            responseTime: Date.now() - startTime,
            model: character.model
          }
        };
      }
    } catch {
      // Fallback: use content buffer
    }

    return {
      content: contentBuffer || 'Не удалось получить ответ.',
      done: true,
      metadata: {
        responseTime: Date.now() - startTime,
        model: character.model
      }
    };
  }

  async generateCharacter(description: string): Promise<Partial<Character>> {
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are a character creation assistant. Return a JSON object with fields:
- name: string (character name)
- description: string (short description, 1-2 sentences)
- personality: string (3-5 personality traits, comma-separated)
- systemPrompt: string (concise system prompt, 80-120 tokens, defines behavior and style)
- greeting: string (character's greeting message)
- tags: string[] (3-5 relevant tags)
- temperature: number (0.3-0.9, based on character type)
- maxTokens: number (200-500)

Respond in the same language as the user's description. Return ONLY valid JSON.`
          },
          { role: 'user', content: description }
        ],
        max_tokens: 600,
        temperature: 0.8,
        response_format: { type: 'json_object' }
      })
    });

    if (!response.ok) throw new Error(`Failed to generate character: ${response.status}`);

    const data = await response.json();
    const parsed = JSON.parse(data.choices[0].message.content);

    return {
      name: parsed.name,
      description: parsed.description,
      personality: parsed.personality,
      systemPrompt: parsed.systemPrompt,
      greeting: parsed.greeting,
      tags: parsed.tags || [],
      temperature: parsed.temperature ?? 0.7,
      maxTokens: parsed.maxTokens ?? 300
    };
  }

  async summarizeConversation(messages: Message[]): Promise<ChatSummary> {
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `Summarize this conversation. Return JSON with:
- summary: string (brief summary, 3-5 sentences)
- keyPoints: string[] (important facts to remember, 3-5 items)
- characterState: string (current situation/context)

Be concise. Return ONLY valid JSON.`
          },
          {
            role: 'user',
            content: messages.map(m => `${m.role}: ${m.content}`).join('\n')
          }
        ],
        max_tokens: 300,
        temperature: 0.3,
        response_format: { type: 'json_object' }
      })
    });

    if (!response.ok) throw new Error(`Failed to summarize: ${response.status}`);

    const data = await response.json();
    const parsed = JSON.parse(data.choices[0].message.content);

    return {
      summary: parsed.summary || '',
      keyPoints: parsed.keyPoints || [],
      characterState: parsed.characterState || '',
      tokenCount: 0
    };
  }
}
