# AI Chat Game — TODO & Features Roadmap

## Phase 1: Foundation (MVP)

### 1.1 Project Setup
- [ ] Initialize Vite + React + TypeScript project
- [ ] Configure ESLint, Prettier, Husky
- [ ] Set up folder structure per architecture doc
- [ ] Add basic CI workflow (lint + type check)

### 1.2 Configuration System
- [ ] Create `config/` directory structure
- [ ] Implement `ConfigLoader` service
- [ ] Create first character config (detective)
- [ ] Add config validation (Zod schemas)
- [ ] Write unit tests for config loading

### 1.3 AI Provider Layer
- [ ] Define `AIProvider` interface
- [ ] Implement `OpenAIProvider`
- [ ] Add provider registry (resolve by config)
- [ ] Mock provider for testing
- [ ] Write unit tests (mocked responses)

### 1.4 State Management
- [ ] Set up Zustand
- [ ] Create `chatStore` with actions
- [ ] Create `characterStore`
- [ ] Write store unit tests

### 1.5 Core UI
- [ ] Character selection screen
- [ ] Chat window (messages list)
- [ ] Message input with send
- [ ] Typing indicator
- [ ] Basic responsive layout

### 1.6 Chat Engine
- [ ] Build message context (system + history)
- [ ] Send message flow
- [ ] Streaming response handling
- [ ] Error handling + retry
- [ ] Integration tests

---

## Phase 2: Polish & Features

### 2.1 Character System
- [ ] Multiple character configs
- [ ] Character profiles with details
- [ ] Character avatars
- [ ] Character-specific greetings
- [ ] Character search/filter

### 2.2 Chat History
- [ ] Local storage persistence
- [ ] Chat list sidebar
- [ ] Resume previous chats
- [ ] Delete/rename chats
- [ ] Export chat as text

### 2.3 UI/UX
- [ ] Theme system (light/dark/custom)
- [ ] Animations (message appear, typing)
- [ ] Mobile-first responsive design
- [ ] Accessibility (a11y)
- [ ] Loading states and skeletons

### 2.4 Settings
- [ ] AI provider selection
- [ ] Model selection per character
- [ ] Temperature/top-p controls
- [ ] Message history length setting
- [ ] Theme preferences

---

## Phase 3: Advanced Features

### 3.1 Multi-Provider Support
- [ ] Anthropic (Claude) provider
- [ ] Local LLM provider (Ollama)
- [ ] Provider fallback chain
- [ ] Cost tracking per provider

### 3.2 Character Memory
- [ ] Long-term memory per character
- [ ] Memory summarization
- [ ] Character learns from conversations
- [ ] Memory persistence

### 3.3 Social Features
- [ ] Share character configs
- [ ] Community character gallery
- [ ] Rate/review characters
- [ ] Character creation wizard

### 3.4 Analytics
- [ ] Usage statistics
- [ ] Token consumption tracking
- [ ] Popular characters
- [ ] Session duration

---

## Phase 4: Production Ready

### 4.1 Performance
- [ ] Code splitting
- [ ] Virtual scrolling for long chats
- [ ] Message caching
- [ ] PWA support (offline mode)

### 4.2 Testing
- [ ] Unit tests (80%+ coverage)
- [ ] Integration tests
- [ ] E2E tests (Playwright)
- [ ] Visual regression tests

### 4.3 Deployment
- [ ] Vercel/Netlify deployment
- [ ] Environment variables
- [ ] CDN optimization
- [ ] Monitoring (Sentry)

---

## Feature Specifications

### Chat Flow
```
1. User selects character from gallery
2. Chat opens with character greeting
3. User types message
4. System builds context:
   - systemPrompt from character config
   - Last N messages from history
   - User message
5. AI provider processes request
6. Response streams to UI in real-time
7. Chat saved to local storage
```

### Character Config Schema
```json
{
  "id": "string (unique)",
  "name": "string",
  "avatar": "string (path or URL)",
  "description": "string",
  "personality": "string",
  "systemPrompt": "string",
  "greeting": "string",
  "aiProvider": "string (provider key)",
  "model": "string",
  "temperature": "number (0-1)",
  "maxTokens": "number",
  "tags": "string[]",
  "voiceStyle": "string (optional)"
}
```

### AI Provider Interface
```typescript
interface AIProvider {
  name: string;
  sendMessage(
    messages: Message[],
    config: AIConfig
  ): Promise<string>;
  
  streamMessage(
    messages: Message[],
    config: AIConfig
  ): AsyncIterable<string>;
  
  validateConfig(config: AIConfig): boolean;
}
```

---

## Testing Checklist

Each module must have:
- [ ] Unit tests for pure functions
- [ ] Mock tests for external services
- [ ] Integration tests for module boundaries
- [ ] Error case coverage
- [ ] Edge case documentation

## Definition of Done
- [ ] Code reviewed
- [ ] Tests passing
- [ ] No TypeScript errors
- [ ] Linting clean
- [ ] Documentation updated
- [ ] Works on mobile