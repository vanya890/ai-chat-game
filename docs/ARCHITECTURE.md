# AI Chat Game — Architecture

## Principles

- **Modular** — each feature is isolated, easy to test and replace
- **Config-driven** — characters, prompts, UI themes via config files, not hardcoded
- **Testable** — business logic separated from UI, dependency injection for services
- **Extensible** — new AI providers, character types, features without rewriting core

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────┐
│                   UI Layer                       │
│  (React Components, Pages, Hooks)               │
├─────────────────────────────────────────────────┤
│               State Management                   │
│  (Zustand stores, selectors)                    │
├─────────────────────────────────────────────────┤
│              Business Logic Layer                │
│  (Chat Engine, Character Manager, Session)      │
├─────────────────────────────────────────────────┤
│               Service Layer                      │
│  (AI Provider API, Storage, Analytics)          │
├─────────────────────────────────────────────────┤
│              Configuration Layer                 │
│  (characters.json, themes.json, settings.json)  │
└─────────────────────────────────────────────────┘
```

---

## Module Breakdown

### 1. Configuration Layer

**Purpose:** All variable data lives in config files.

```
config/
├── characters/          # Character definitions
│   ├── detective.json
│   ├── wizard.json
│   └── scientist.json
├── themes.json          # UI themes
├── ai-providers.json    # AI provider configs
└── app-settings.json    # App-level settings
```

**Character config example:**
```json
{
  "id": "detective",
  "name": "Шерлок",
  "avatar": "/avatars/detective.png",
  "personality": "analytical, observant, dry humor",
  "systemPrompt": "You are a brilliant detective...",
  "greeting": "Elementary, my dear user.",
  "aiProvider": "openai",
  "model": "gpt-4o-mini",
  "temperature": 0.7
}
```

### 2. Service Layer

**AI Provider Interface:**
```typescript
interface AIProvider {
  sendMessage(messages: Message[], config: AIConfig): Promise<string>;
  streamMessage(messages: Message[], config: AIConfig): AsyncIterable<string>;
}

// Implementations:
// - OpenAIProvider
// - AnthropicProvider
// - LocalLLMProvider
```

**Storage Service:**
```typescript
interface StorageService {
  saveChat(chat: Chat): Promise<void>;
  loadChat(chatId: string): Promise<Chat | null>;
  listChats(): Promise<ChatSummary[]>;
  deleteChat(chatId: string): Promise<void>;
}
```

### 3. Business Logic Layer

**Chat Engine:**
- Manages conversation flow
- Builds message context (system prompt + history)
- Handles streaming responses
- Error recovery and retries

**Character Manager:**
- Loads character configs
- Resolves AI provider for each character
- Validates character definitions

**Session Manager:**
- Active chat state
- Character switching
- Chat history navigation

### 4. State Management (Zustand)

```typescript
// stores/chatStore.ts
interface ChatState {
  activeChat: Chat | null;
  characters: Character[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  selectCharacter: (id: string) => void;
  sendMessage: (text: string) => Promise<void>;
  loadChat: (id: string) => void;
  createNewChat: () => void;
}
```

### 5. UI Layer

```
src/
├── components/
│   ├── chat/
│   │   ├── ChatWindow.tsx
│   │   ├── MessageBubble.tsx
│   │   ├── MessageInput.tsx
│   │   └── TypingIndicator.tsx
│   ├── character/
│   │   ├── CharacterCard.tsx
│   │   ├── CharacterSelector.tsx
│   │   └── CharacterProfile.tsx
│   ├── layout/
│   │   ├── Sidebar.tsx
│   │   ├── Header.tsx
│   │   └── ThemeToggle.tsx
│   └── ui/              # Reusable primitives
│       ├── Button.tsx
│       ├── Avatar.tsx
│       └── Modal.tsx
├── pages/
│   ├── Home.tsx         # Character selection
│   ├── Chat.tsx         # Active chat
│   └── Settings.tsx     # App settings
├── hooks/
│   ├── useChat.ts
│   ├── useCharacter.ts
│   └── useTheme.ts
└── services/
    ├── ai/
    │   ├── provider.ts
    │   ├── openai.ts
    │   └── anthropic.ts
    ├── storage/
    │   ├── local-storage.ts
    │   └── indexed-db.ts
    └── config-loader.ts
```

---

## Data Flow

```
User types message
    ↓
MessageInput → onSubmit
    ↓
chatStore.sendMessage()
    ↓
Chat Engine builds context:
  - character.systemPrompt
  - character.greeting
  - message history (last N messages)
    ↓
AI Provider sends request
    ↓
Stream response → update store
    ↓
UI re-renders with new messages
```

---

## Testing Strategy

| Layer | What to test | How |
|-------|-------------|-----|
| Config | Character validation | Unit tests with valid/invalid JSON |
| Services | AI provider mock | Mock fetch, test request/response shape |
| Business Logic | Chat engine | Unit tests with mocked AI provider |
| State | Store actions | Test state transitions |
| UI | Component rendering | React Testing Library, snapshot tests |
| Integration | Full chat flow | E2E with Playwright, mocked AI |

---

## Key Design Decisions

1. **Zustand over Redux** — simpler, less boilerplate, better TypeScript
2. **Config-driven characters** — add new characters without code changes
3. **Provider interface** — swap AI backends without touching UI
4. **Streaming-first** — better UX, show tokens as they arrive
5. **Local-first storage** — works offline, sync later if needed