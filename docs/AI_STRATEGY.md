# AI Chat Game — AI Generation Strategy

## Quick Links

- [Token Dashboard](TOKEN_DASHBOARD.md) — Track your token usage and costs
- [Character Editor Guide](CHARACTER_EDITOR.md) — Write efficient system prompts
- [Troubleshooting](TROUBLESHOOTING.md) — Fix common issues

---

## Goals

1. **Minimize token cost** — send only what's necessary
2. **Maximize response quality** — consistent, in-character responses
3. **Predictable behavior** — no hallucinations, no breaking character

---

## Token Cost Breakdown

A single API call costs tokens for:
```
Total tokens = system_prompt + message_history + user_message + response
```

**Example (GPT-4o-mini, $0.15/1M input, $0.60/1M output):**

| Component | Tokens | Cost |
|-----------|--------|------|
| System prompt (verbose) | 500 | $0.000075 |
| Message history (20 msgs) | 2000 | $0.000300 |
| User message | 50 | $0.000007 |
| AI response | 300 | $0.000180 |
| **Total per message** | **2850** | **$0.000562** |
| **Per 100 messages** | | **$0.056** |
| **Per 1000 messages** | | **$0.56** |

With GPT-4o ($2.50/1M input, $10/1M output):
| **Per 1000 messages** | | **$8.50** |

**Conclusion:** Model choice matters 15x more than optimization. But optimization still saves real money.

---

## Strategy 1: System Prompt Optimization

### Problem: Verbose system prompts waste tokens on every request

### Bad (500+ tokens):
```
You are Sherlock Holmes, a brilliant detective from Victorian London. 
You live at 221B Baker Street with Dr. John Watson. You are known for 
your keen observation skills, deductive reasoning, and sometimes 
arrogant demeanor. You play the violin when thinking. You use a 
magnifying glass to examine crime scenes. You often say "Elementary, 
my dear Watson" although this phrase never appeared in the original 
Conan Doyle stories. You should always stay in character and never 
break the fourth wall. When users ask you questions, respond as 
Sherlock would, using your analytical mind to deduce answers from 
the information provided. You should be concise but thorough...
```

### Good (80-120 tokens):
```
You are Sherlock Holmes. Analytical, observant, dry humor. 
Speak with confidence. Deduce from details. Keep responses concise.
```

### Rules for system prompts:
1. **Max 150 tokens** — be specific, not verbose
2. **No backstory** — AI already knows famous characters
3. **Focus on behavior** — how to respond, not who they are
4. **Include response format** — "Keep responses under 200 words"
5. **Language hint** — "Respond in Russian" (if needed)

### Template:
```
You are {name}. {3-5 personality traits}. 
{1-2 behavioral rules}. {response length constraint}. {language}.
```

---

## Strategy 2: Context Window Management

### Problem: Sending full chat history = expensive

### Approach: Sliding window + summary

```
┌─────────────────────────────────────────────────────┐
│  Request Context Structure                          │
├─────────────────────────────────────────────────────┤
│  1. System prompt (80-120 tokens)                   │
│  2. Character greeting (20-40 tokens)               │
│  3. Summary of old messages (100-150 tokens)        │
│     [Summarized: User asked about X, character      │
│      explained Y, they discussed Z...]              │
│  4. Last N messages (500-800 tokens)                │
│     [Full text of recent conversation]              │
│  5. User's new message (50-100 tokens)              │
├─────────────────────────────────────────────────────┤
│  Total: ~800-1200 tokens per request                │
└─────────────────────────────────────────────────────┘
```

### Implementation:

```typescript
interface ChatContext {
  systemPrompt: string;      // Always included (~100 tokens)
  greeting: string;          // Always included (~30 tokens)
  summary?: string;          // Added when history > threshold (~120 tokens)
  recentMessages: Message[]; // Last N messages (~600 tokens)
  newUserMessage: string;    // Current input (~50 tokens)
}

function buildContext(chat: Chat, config: ChatConfig): ChatContext {
  const MAX_RECENT_MESSAGES = 10; // Last 10 messages full text
  const SUMMARY_THRESHOLD = 20;   // Summarize when > 20 messages
  
  const recentMessages = chat.messages.slice(-MAX_RECENT_MESSAGES);
  
  let summary: string | undefined;
  if (chat.messages.length > SUMMARY_THRESHOLD) {
    const oldMessages = chat.messages.slice(0, -MAX_RECENT_MESSAGES);
    summary = summarizeConversation(oldMessages);
  }
  
  return { systemPrompt, greeting, summary, recentMessages, newUserMessage };
}
```

### Summary generation:
- Triggered when chat exceeds threshold (e.g., 20 messages)
- Uses a cheap model (gpt-4o-mini) to summarize old messages
- Summary is cached and updated incrementally
- Costs ~50 tokens per summary generation (one-time)

**Savings:**
- Without summary: 20 messages × 100 tokens = 2000 tokens
- With summary: 120 (summary) + 10 × 100 (recent) = 1120 tokens
- **Saves ~44% on history tokens**

---

## Strategy 3: Response Length Control

### Problem: AI rambles = expensive output tokens

### Solution: Explicit length constraints in system prompt

```typescript
// In character config:
{
  "maxResponseTokens": 300,        // Hard limit (API parameter)
  "responseStyle": "concise",      // Behavioral hint
  "systemPrompt": "...Keep responses under 150 words."
}
```

### API parameters:
```typescript
{
  max_tokens: 300,           // Hard cutoff
  temperature: 0.7,          // Balanced creativity
  top_p: 0.9,                // Nucleus sampling
  presence_penalty: 0.1,     // Slight novelty boost
  frequency_penalty: 0.1     // Avoid repetition
}
```

### Response length presets:
| Preset | Max tokens | Use case |
|--------|-----------|----------|
| `brief` | 150 | Quick answers, greetings |
| `normal` | 300 | Default conversation |
| `detailed` | 600 | Explanations, stories |
| `unlimited` | 2000 | Creative writing |

---

## Strategy 4: Model Tiering

### Problem: Using expensive model for everything

### Solution: Route by complexity

```typescript
function selectModel(message: string, character: Character): ModelConfig {
  const complexity = estimateComplexity(message);
  
  if (complexity === 'simple') {
    // Greetings, short questions, yes/no
    return { model: 'gpt-4o-mini', maxTokens: 150 };
  }
  
  if (complexity === 'moderate') {
    // Normal conversation, advice, analysis
    return { model: 'gpt-4o-mini', maxTokens: 300 };
  }
  
  if (complexity === 'complex') {
    // Creative writing, complex reasoning, multi-part questions
    return { model: 'gpt-4o', maxTokens: 600 };
  }
  
  return character.defaultModel;
}

function estimateComplexity(message: string): Complexity {
  const words = message.split(/\s+/).length;
  const hasQuestionMarks = (message.match(/\?/g) || []).length;
  const hasMultipleParts = message.includes('\n') || message.includes(';');
  
  if (words < 10 && hasQuestionMarks <= 1) return 'simple';
  if (words < 50 && hasQuestionMarks <= 2) return 'moderate';
  return 'complex';
}
```

### Cost comparison (per 1000 messages):
| Strategy | Model | Cost |
|----------|-------|------|
| All GPT-4o | gpt-4o | $8.50 |
| All GPT-4o-mini | gpt-4o-mini | $0.56 |
| Tiered (80% mini, 20% 4o) | mixed | $2.15 |

**Tiered saves 75% vs all GPT-4o, with quality where it matters.**

---

## Strategy 5: Response Caching

### Problem: Same question asked multiple times = wasted tokens

### Solution: Cache identical requests

```typescript
const cache = new LRUCache({ max: 500 });

async function sendMessage(character: Character, userMessage: string) {
  // Cache key: character + message (normalized)
  const cacheKey = hash(
    character.id + 
    normalizeMessage(userMessage) + 
    character.systemPrompt
  );
  
  const cached = cache.get(cacheKey);
  if (cached) {
    return cached; // Free! No API call
  }
  
  const response = await aiProvider.sendMessage(...);
  cache.set(cacheKey, response);
  return response;
}

function normalizeMessage(msg: string): string {
  return msg
    .toLowerCase()
    .trim()
    .replace(/[^\w\sа-яё]/gi, '')  // Remove punctuation
    .replace(/\s+/g, ' ');          // Normalize whitespace
}
```

**Cache hit rate estimate:** 5-15% for typical usage
**Savings:** 5-15% of API calls = free responses

---

## Strategy 6: Structured Output (when needed)

### Problem: AI sometimes breaks character or adds unwanted text

### Solution: JSON mode for specific scenarios

```typescript
// For character creation AI (F11):
{
  "response_format": { "type": "json_object" },
  "systemPrompt": "Return a JSON object with fields: name, description, personality, systemPrompt, greeting, tags"
}

// Expected response:
{
  "name": "Мудрая Черепаха",
  "description": "Древняя черепаха, философ",
  "personality": "wise, slow-speaking, philosophical",
  "systemPrompt": "You are a wise old turtle...",
  "greeting": "Приветствую тебя, молодой друг...",
  "tags": ["wisdom", "philosophy", "animals"]
}
```

**Benefits:**
- Guaranteed structure
- Easy to validate
- No parsing errors
- Slightly more tokens (JSON overhead) but worth it for reliability

---

## Strategy 7: Prompt Compression

### Problem: User messages can be verbose

### Solution: Compress long user messages before sending to AI

```typescript
// Only for very long messages (>500 tokens)
async function compressIfNeeded(message: string): Promise<string> {
  if (countTokens(message) < 500) return message;
  
  // Use cheap model to summarize
  const compressed = await gpt4oMini.complete(
    `Summarize this message preserving all key points: ${message}`
  );
  
  return compressed; // Usually 50-70% shorter
}
```

**Trade-off:** Costs ~50 tokens for compression, saves 200+ tokens in main request.
**Worth it when:** user message > 500 tokens.

---

## Strategy 8: Streaming with Early Stop

### Problem: AI generates 300 tokens but user only needed 50

### Solution: Let user cancel streaming

```typescript
// User clicks "Stop" button
const abortController = new AbortController();

const response = await aiProvider.streamMessage(messages, {
  signal: abortController.signal
});

// On stop click:
abortController.abort();
// Only pay for tokens generated so far
```

**Savings:** 20-40% on responses where user cancels early.

---

## Complete Request Template

```typescript
function buildAPIRequest(chat: Chat, character: Character, userMessage: string) {
  const messages = [
    // 1. System prompt (80-120 tokens)
    { role: 'system', content: character.systemPrompt },
    
    // 2. Greeting (20-40 tokens)
    { role: 'assistant', content: character.greeting },
    
    // 3. Summary if needed (~120 tokens)
    ...(chat.summary ? [{ role: 'system', content: `Previous conversation summary: ${chat.summary}` }] : []),
    
    // 4. Recent messages (500-800 tokens)
    ...chat.recentMessages.map(m => ({ role: m.role, content: m.content })),
    
    // 5. User message (50-100 tokens)
    { role: 'user', content: userMessage }
  ];
  
  return {
    model: selectModel(userMessage, character).model,
    messages,
    max_tokens: selectModel(userMessage, character).maxTokens,
    temperature: character.temperature,
    stream: true
  };
}
```

---

## Token Budget Calculator

```typescript
interface TokenBudget {
  systemPrompt: 100;      // Fixed
  greeting: 30;           // Fixed
  summary: 120;           // Conditional
  recentMessages: 800;    // 10 messages × 80 tokens avg
  userMessage: 80;        // Average
  response: 250;          // Average
  // ---
  total: 1380;            // Per message average
}

// Monthly cost estimate (GPT-4o-mini):
// 1000 messages × 1380 tokens × $0.15/1M = $0.21
// 10000 messages × 1380 tokens × $0.15/1M = $2.07
```

---

## Summary: Token Savings

| Strategy | Savings | Effort |
|----------|---------|--------|
| Concise system prompts | 30-40% on system tokens | Low |
| Context window (summary + sliding) | 40-50% on history tokens | Medium |
| Response length limits | 20-30% on output tokens | Low |
| Model tiering | 50-75% vs all-expensive | Medium |
| Response caching | 5-15% of all calls | Low |
| Streaming cancel | 20-40% on cancelled responses | Low |
| **Combined** | **60-80% vs naive approach** | |

---

## Quality Guarantees

To ensure consistent, correct responses:

1. **System prompt rules:**
   - "Stay in character at all times"
   - "Never mention you are an AI"
   - "If unsure, respond in character rather than breaking"

2. **Temperature by character type:**
   - Factual characters (detective, scientist): 0.3-0.5
   - Creative characters (wizard, poet): 0.7-0.9
   - Balanced (default): 0.6-0.7

3. **Few-shot examples (optional, for difficult characters):**
   - Include 1-2 example exchanges in system prompt
   - Shows AI the expected response style
   - Costs ~100 tokens but dramatically improves quality

4. **Post-processing validation:**
   - Check response length (truncate if exceeds limit)
   - Filter out meta-commentary ("As an AI...")
   - Retry on empty or nonsensical responses
