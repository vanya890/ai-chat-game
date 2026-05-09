# AI Chat Game — JSON Schema for AI Responses

## Philosophy

**Every AI response is structured JSON.** No free-form text parsing, no guessing.

Benefits:
- Guaranteed response format
- Easy to validate and retry on bad responses
- Enables rich UI features (actions, suggestions, metadata)
- Consistent behavior across all characters and models
- Easy to extend without breaking existing code

---

## Core Response Schema

### Base Schema (all responses)

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "AIResponse",
  "type": "object",
  "required": ["content", "done"],
  "properties": {
    "content": {
      "type": "string",
      "description": "The main response text (what the character says)"
    },
    "done": {
      "type": "boolean",
      "description": "True if response is complete, false if truncated or needs continuation"
    },
    "mood": {
      "type": "string",
      "enum": ["neutral", "happy", "sad", "angry", "surprised", "thoughtful", "playful", "serious"],
      "description": "Character's emotional state for UI (emoji, color hints)"
    },
    "actions": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["type", "label"],
        "properties": {
          "type": {
            "type": "string",
            "enum": ["suggestion", "question", "command", "link", "image"]
          },
          "label": {
            "type": "string",
            "description": "Button text or action description"
          },
          "payload": {
            "type": "string",
            "description": "Action data (URL, command, suggested reply text)"
          }
        }
      },
      "description": "Suggested user actions (quick replies, buttons)"
    },
    "metadata": {
      "type": "object",
      "properties": {
        "tokenCount": {
          "type": "number",
          "description": "Approximate tokens in content"
        },
        "responseTime": {
          "type": "number",
          "description": "Response generation time in ms"
        },
        "model": {
          "type": "string",
          "description": "Model used for this response"
        }
      }
    }
  }
}
```

### Example Response

```json
{
  "content": "Элементарно. Алмаз спрятан в камине — проверьте левую стенку.",
  "done": true,
  "mood": "confident",
  "actions": [
    {
      "type": "suggestion",
      "label": "Проверить камин",
      "payload": "Я проверю левую стенку камина"
    },
    {
      "type": "question",
      "label": "Как ты это узнал?",
      "payload": "Как ты догадался про камин?"
    }
  ],
  "metadata": {
    "tokenCount": 45,
    "responseTime": 1200,
    "model": "gpt-4o-mini"
  }
}
```

---

## Extended Schemas by Use Case

### 1. Chat Response (default)

```typescript
interface ChatResponse {
  content: string;        // What the character says
  done: boolean;          // Is response complete?
  mood?: string;          // Emotional state for UI
  actions?: Action[];     // Suggested replies
  metadata?: Metadata;    // Debug info
}
```

### 2. Character Creation (AI-assisted)

```typescript
interface CharacterCreationResponse {
  name: string;
  description: string;
  personality: string;
  systemPrompt: string;
  greeting: string;
  tags: string[];
  suggestedModel: string;  // "gpt-4o-mini" | "gpt-4o" | "claude"
  temperature: number;     // 0.0 - 1.0
  confidence: number;      // 0.0 - 1.0, how confident AI is in this config
}
```

### 3. Chat Summary (for context compression)

```typescript
interface ChatSummaryResponse {
  summary: string;         // Condensed version of old messages
  keyPoints: string[];     // Important facts to remember
  characterState: string;  // Current situation/context
  tokenCount: number;      // Tokens in summary
}
```

### 4. Message Classification (for model routing)

```typescript
interface MessageClassificationResponse {
  complexity: "simple" | "moderate" | "complex";
  intent: "greeting" | "question" | "statement" | "command" | "creative";
  estimatedTokens: number;
  suggestedModel: string;
  suggestedMaxTokens: number;
}
```

### 5. Error Recovery

```typescript
interface ErrorResponse {
  error: true;
  code: string;            // "rate_limit" | "invalid_response" | "network_error"
  message: string;         // User-friendly error message
  retryable: boolean;      // Can user retry?
  retryAfter?: number;     // Seconds to wait (for rate limits)
}
```

---

## Implementation

### System Prompt Template (JSON mode)

```
You are {name}. {personality traits}.

Respond in JSON format ONLY. No text outside JSON.
{
  "content": "your response text",
  "done": true,
  "mood": "neutral|happy|sad|angry|surprised|thoughtful|playful|serious",
  "actions": [
    {"type": "suggestion", "label": "button text", "payload": "suggested reply"}
  ]
}

Rules:
- content: stay in character, {length constraint}
- done: true if complete, false if interrupted
- mood: your current emotional state
- actions: 0-3 suggested user replies (optional)
- Respond in {language}
```

### API Call with JSON Schema

```typescript
// OpenAI API with response_format
const response = await openai.chat.completions.create({
  model: "gpt-4o-mini",
  messages: [
    { role: "system", content: systemPrompt },
    ...chatHistory,
    { role: "user", content: userMessage }
  ],
  response_format: {
    type: "json_schema",
    json_schema: {
      name: "AIResponse",
      schema: AI_RESPONSE_SCHEMA,
      strict: true  // Enforces schema compliance
    }
  },
  max_tokens: 400,
  temperature: 0.7
});

const parsed = JSON.parse(response.choices[0].message.content);
```

### Validation & Retry

```typescript
import { z } from 'zod';

const AIResponseSchema = z.object({
  content: z.string().min(1).max(2000),
  done: z.boolean(),
  mood: z.enum(["neutral", "happy", "sad", "angry", "surprised", "thoughtful", "playful", "serious"]).optional(),
  actions: z.array(z.object({
    type: z.enum(["suggestion", "question", "command", "link", "image"]),
    label: z.string(),
    payload: z.string()
  })).max(5).optional(),
  metadata: z.object({
    tokenCount: z.number().optional(),
    responseTime: z.number().optional(),
    model: z.string().optional()
  }).optional()
});

async function getValidatedResponse(messages: Message[], maxRetries = 2): Promise<AIResponse> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const raw = await callAI(messages);
      const parsed = JSON.parse(raw);
      return AIResponseSchema.parse(parsed);
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      // Retry with error hint
      messages.push({
        role: "system",
        content: "Previous response was invalid JSON. Respond with valid JSON only."
      });
    }
  }
}
```

---

## Token Cost Analysis

### Overhead of JSON format

| Component | Free text | JSON format | Overhead |
|-----------|-----------|-------------|----------|
| Response text | 200 tokens | 200 tokens | 0 |
| JSON structure | 0 | ~15 tokens | +15 |
| Mood field | 0 | ~5 tokens | +5 |
| Actions (2) | 0 | ~40 tokens | +40 |
| **Total** | **200** | **260** | **+30%** |

### But we save elsewhere:

1. **No parsing overhead** — no regex, no heuristics
2. **Automatic retry on bad format** — fewer wasted calls
3. **Structured actions** — no need for separate "suggestion" API call
4. **Model routing built-in** — classification response costs ~30 tokens but saves 75% on model costs

### Net effect:
- **+15-20% tokens per response** (JSON overhead)
- **-40-60% total cost** (better routing, fewer retries, caching)
- **Net: 30-50% cost savings** with much better reliability

---

## Streaming with JSON

### Challenge: JSON can't be streamed token-by-token naturally

### Solution: Stream the `content` field, parse rest at end

```typescript
// AI streams JSON like:
// {"content": "Hello, 
// I am Sherlock...", "done": true, "mood": "neutral"}

// Client extracts content field in real-time:
let contentBuffer = "";
let inContent = false;

for await (const chunk of stream) {
  const text = chunk.choices[0].delta.content || "";
  
  if (text.includes('"content":')) {
    inContent = true;
    continue;
  }
  
  if (inContent) {
    if (text.includes('"') && text.includes(':')) {
      // End of content field
      inContent = false;
      continue;
    }
    contentBuffer += text.replace(/"/g, '');
    updateUI(contentBuffer); // Stream to user
  }
}

// After stream ends, parse full JSON for metadata
const fullResponse = JSON.parse(fullText);
```

### Alternative: Two-part response

```typescript
// Part 1: Stream content (plain text)
const contentStream = await ai.streamMessage(messages);

// Part 2: Generate metadata (separate cheap call, async)
const metadata = await ai.generateMetadata({
  content: fullContent,
  character: characterConfig
});
// Returns: { mood, actions, done }

// Total: 1 streaming call + 1 cheap metadata call (~50 tokens)
```

**Recommendation:** Use OpenAI's `response_format: { type: "json_schema", strict: true }` — it handles streaming JSON natively.

---

## UI Integration

### Rendering a JSON Response

```tsx
function ChatMessage({ response }: { response: AIResponse }) {
  return (
    <div className="message">
      <div className="content">
        {response.content}
      </div>
      
      {response.mood && (
        <div className="mood-indicator">
          {moodToEmoji(response.mood)}
        </div>
      )}
      
      {response.actions && response.actions.length > 0 && (
        <div className="quick-actions">
          {response.actions.map((action, i) => (
            <button
              key={i}
              onClick={() => sendMessage(action.payload)}
            >
              {action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
```

### Mood to Emoji Mapping

```typescript
const moodEmoji: Record<string, string> = {
  neutral: "😐",
  happy: "😊",
  sad: "😢",
  angry: "😠",
  surprised: "😲",
  thoughtful: "🤔",
  playful: "😏",
  serious: "🧐"
};
```

---

## Migration Path

### Phase 1 (MVP): Simple JSON
```json
{ "content": "response text", "done": true }
```
Minimal overhead, immediate benefit of structured parsing.

### Phase 1.5: Add mood + actions
```json
{
  "content": "response text",
  "done": true,
  "mood": "thoughtful",
  "actions": [{ "type": "suggestion", "label": "...", "payload": "..." }]
}
```

### Phase 2: Full schema with metadata
All fields active, including metadata for debugging and analytics.

---

## Error Handling

### Invalid JSON Response

```typescript
try {
  const response = await callAI(messages);
  const parsed = JSON.parse(response);
  validateSchema(parsed);
} catch (error) {
  // Auto-retry with hint
  const retryMessages = [
    ...messages,
    { role: "system", content: "ERROR: Response must be valid JSON. Try again." }
  ];
  return await callAI(retryMessages);
}
```

### Schema Validation Failure

```typescript
const result = AIResponseSchema.safeParse(parsed);
if (!result.success) {
  console.error("Schema validation failed:", result.error);
  // Extract content if possible, use fallback for rest
  return {
    content: parsed.content || "Sorry, I had trouble responding.",
    done: true,
    mood: "neutral",
    actions: []
  };
}
```

---

## Comparison: Free Text vs JSON Schema

| Aspect | Free Text | JSON Schema |
|--------|-----------|-------------|
| Parsing | Regex/heuristics, fragile | JSON.parse, reliable |
| UI actions | Separate API call or none | Built-in |
| Mood/emotion | Guess from text | Explicit field |
| Validation | Impossible | Automatic (Zod) |
| Retry on error | Manual | Automatic |
| Streaming | Easy | Requires handling |
| Token overhead | 0 | +15-20% |
| Reliability | 70-80% | 95%+ |
| Extensibility | Hard | Easy (add fields) |

**Verdict:** JSON Schema wins on reliability, extensibility, and total cost despite token overhead.
