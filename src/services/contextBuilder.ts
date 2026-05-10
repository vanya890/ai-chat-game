import type { Message, Character, ChatSummary } from '../types';

const MAX_RECENT_MESSAGES = 10;
const SUMMARY_THRESHOLD = 20;

export function buildChatContext(
  character: Character,
  messages: Message[],
  newUserMessage: string,
  summary?: ChatSummary
): Array<{ role: string; content: string }> {
  const contextMessages: Array<{ role: string; content: string }> = [];

  // 1. System prompt
  contextMessages.push({
    role: 'system',
    content: `${character.systemPrompt}\n\nIMPORTANT: Always respond in valid JSON format according to the provided schema. Never output text outside JSON.`
  });

  // 2. Character greeting (as first assistant message)
  if (messages.length === 0) {
    contextMessages.push({
      role: 'assistant',
      content: JSON.stringify({
        content: character.greeting,
        done: true,
        mood: 'neutral'
      })
    });
  }

  // 3. Summary of old messages (if exists)
  if (summary && messages.length > SUMMARY_THRESHOLD) {
    contextMessages.push({
      role: 'system',
      content: `Previous conversation summary: ${summary.summary}\nKey facts: ${summary.keyPoints.join('; ')}\nCurrent state: ${summary.characterState}`
    });
  }

  // 4. Recent messages (sliding window)
  const recentMessages = messages.slice(-MAX_RECENT_MESSAGES);
  for (const msg of recentMessages) {
    if (msg.role === 'assistant') {
      // Wrap assistant messages in JSON if they aren't already
      let content = msg.content;
      try {
        JSON.parse(content);
      } catch {
        content = JSON.stringify({ content: msg.content, done: true });
      }
      contextMessages.push({ role: 'assistant', content });
    } else {
      contextMessages.push({ role: msg.role, content: msg.content });
    }
  }

  // 5. User's new message
  contextMessages.push({ role: 'user', content: newUserMessage });

  return contextMessages;
}

export function needsSummary(messageCount: number): boolean {
  return messageCount > SUMMARY_THRESHOLD;
}

export function estimateComplexity(message: string): 'simple' | 'moderate' | 'complex' {
  const words = message.split(/\s+/).length;
  const questionMarks = (message.match(/\?/g) || []).length;

  if (words < 10 && questionMarks <= 1) return 'simple';
  if (words < 50 && questionMarks <= 2) return 'moderate';
  return 'complex';
}

export function selectModelForMessage(message: string, character: Character): { model: string; maxTokens: number } {
  const complexity = estimateComplexity(message);

  switch (complexity) {
    case 'simple':
      return { model: character.model, maxTokens: Math.min(character.maxTokens, 150) };
    case 'moderate':
      return { model: character.model, maxTokens: character.maxTokens };
    case 'complex':
      return { model: character.model, maxTokens: Math.min(character.maxTokens, 600) };
  }
}
