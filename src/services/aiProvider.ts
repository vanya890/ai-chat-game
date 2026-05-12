import type { Character, AIResponse, Message, ChatSummary } from '../types';
import { useTokenStore } from '../stores/tokenStore';

const AI_RESPONSE_SCHEMA = {
  type: 'object',
  properties: {
    content: { type: 'string', description: 'The response text' },
    done: { type: 'boolean', description: 'Whether the response is complete' },
    mood: { type: 'string', enum: ['neutral', 'happy', 'sad', 'angry', 'surprised', 'thoughtful', 'mysterious', 'playful'], description: 'Character mood' },
    actions: {
      type: 'array',
      description: 'Suggested quick actions',
      items: {
        type: 'object',
        properties: {
          label: { type: 'string' },
          payload: { type: 'string' }
        },
        required: ['label', 'payload']
      }
    }
  },
  required: ['content', 'done']
};

export class OpenAIProvider {
  private baseUrl: string;
  private apiKey: string;

  constructor(apiKey: string, baseUrl?: string) {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl || 'https://api.openai.com/v1';
  }

  async sendMessage(
    messages: Array<{ role: string; content: string }>,
    character: Character,
    onChunk: (chunk: string) => void,
    signal?: AbortSignal
  ): Promise<AIResponse> {
    const url = `${this.baseUrl}/chat/completions`;
    const body = {
      model: character.model,
      messages,
      temperature: character.temperature,
      max_tokens: character.maxTokens,
      stream: true,
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'ai_response',
          schema: AI_RESPONSE_SCHEMA,
          strict: false
        }
      }
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify(body),
      signal
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`API error ${response.status}: ${error}`);
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error('No response body');

    const decoder = new TextDecoder();
    let fullContent = '';
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed === 'data: [DONE]') continue;
        if (!trimmed.startsWith('data: ')) continue;

        try {
          const parsed = JSON.parse(trimmed.slice(6));
          const delta = parsed.choices?.[0]?.delta;
          if (delta?.content) {
            fullContent += delta.content;
            onChunk(delta.content);
          }
        } catch {
          // Skip malformed lines
        }
      }
    }

    // Parse final JSON response
    let parsed: AIResponse;
    try {
      parsed = JSON.parse(fullContent);
    } catch {
      // Fallback: treat raw text as content
      parsed = { content: fullContent, done: true, mood: 'neutral', actions: [] };
    }

    // Track token usage
    const estimatedPromptTokens = messages.reduce((sum, m) => sum + Math.ceil(m.content.length / 4), 0);
    const estimatedCompletionTokens = Math.ceil(parsed.content.length / 4);
    await useTokenStore.getState().addUsage({
      chatId: messages.find(m => m.role === 'user') ? 'unknown' : '',
      characterId: character.id,
      model: character.model,
      promptTokens: estimatedPromptTokens,
      completionTokens: estimatedCompletionTokens,
      totalTokens: estimatedPromptTokens + estimatedCompletionTokens,
      timestamp: new Date().toISOString(),
      date: new Date().toISOString().slice(0, 10)
    });

    return parsed;
  }

  async summarizeConversation(messages: Message[]): Promise<ChatSummary> {
    const summaryMessages = [
      { role: 'system' as const, content: 'Summarize this conversation. Return JSON with: summary (1-2 sentences), keyPoints (array of 3-5 key facts), characterState (current emotional state of character).' },
      ...messages.slice(-10).map(m => ({ role: m.role, content: m.content }))
    ];

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: summaryMessages,
        max_tokens: 300,
        temperature: 0.3,
        response_format: { type: 'json_object' }
      })
    });

    const data = await response.json();
    const content = data.choices[0].message.content;
    return JSON.parse(content);
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
          { role: 'system', content: 'Create a character. Return JSON with: name, description, personality, systemPrompt (concise, 80-120 tokens), greeting, tags (array), temperature (0.3-0.9), maxTokens (200-500). Respond in Russian.' },
          { role: 'user', content: description }
        ],
        max_tokens: 600,
        temperature: 0.8,
        response_format: { type: 'json_object' }
      })
    });

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
      maxTokens: parsed.maxTokens ?? 300,
      model: 'gpt-4o-mini'
    };
  }
}
