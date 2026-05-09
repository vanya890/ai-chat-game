# AI Chat Game — Features & User Experience

## User Experience Flow

### First Launch
```
1. User opens app
   → Sees character gallery (cards with avatars, names, descriptions)
   → "Welcome! Choose a character to chat with"
   
2. User clicks a character card
   → Chat opens instantly
   → Character greeting appears with typing animation
   
3. User types first message
   → Message appears in chat bubble
   → Typing indicator shows
   → Response streams in real-time (token by token)
   
4. User continues chatting
   → Natural conversation flow
   → Can scroll through history
   → Can copy messages
```

### Returning User
```
1. User opens app
   → Sees character gallery (default tab)
   → Can switch to "My Chats" tab to see all conversations
   
2. User clicks "My Chats" tab
   → List of all chats grouped by character
   → Each shows: character avatar, name, last message preview, time
   → Click to resume chat
   
3. User can:
   → Start new chat with any character (from gallery)
   → Resume existing chat (from My Chats tab)
   → Create/edit characters (from Characters tab)
   → Open settings
```

### Navigation Structure
```
┌─────────────────────────────────────────┐
│  [Gallery]  [My Chats]  [Characters]    │  ← Tab bar
├─────────────────────────────────────────┤
│                                         │
│  Content changes based on active tab:   │
│                                         │
│  Gallery     → Character cards grid     │
│  My Chats    → List of conversations    │
│  Characters  → Character management     │
│                                         │
└─────────────────────────────────────────┘
```

---

## Feature List

### Core Features (MVP — Phase 1)

#### F1. Character Gallery
**What:** Grid/list of available characters with cards.
**Details:**
- Each card shows: avatar, name, short description, tags
- Cards are clickable → opens chat
- Responsive grid (1 col mobile, 2-3 tablet, 4+ desktop)
- Characters loaded from config files / database
- "Start Chat" button on each card

**User sees:**
```
┌─────────────────────────────────────────┐
│  [Gallery]  [My Chats]  [Characters]    │
├─────────────────────────────────────────┤
│  Choose a Character                      │
│                                         │
│  ┌──────────┐  ┌──────────┐  ┌───────┐ │
│  │  🕵️      │  │  🧙      │  │  🤖   │ │
│  │ Шерлок   │  │ Мерлин   │  │  AI   │ │
│  │ Детектив │  │ Маг      │  │Robot  │ │
│  │ #mystery │  │ #fantasy │  │ #sci-fi│ │
│  └──────────┘  └──────────┘  └───────┘ │
└─────────────────────────────────────────┘
```

#### F2. Chat Interface
**What:** Main chat screen with message history and input.
**Details:**
- Messages displayed as bubbles (user right, assistant left)
- Character avatar next to assistant messages
- Timestamps on hover
- Auto-scroll to bottom on new message
- Streaming response (tokens appear one by one)
- Typing indicator while waiting for response
- Character name in header with back button

**User sees:**
```
┌─────────────────────────────────────────┐
│ ← Шерлок                    [Settings]  │
├─────────────────────────────────────────┤
│                                         │
│  🕵️ Ах, новый клиент. Проходите...     │
│                                         │
│                        Помоги мне найти │
│                        пропавший алмаз  │
│                                         │
│  🕵️ Элементарно. Скажите, когда вы      │
│     последний раз видели...             │
│                                         │
├─────────────────────────────────────────┤
│ [Type a message...]              [Send] │
└─────────────────────────────────────────┘
```

#### F3. Message Input
**What:** Text input for sending messages.
**Details:**
- Multi-line text area (auto-resize)
- Enter to send, Shift+Enter for new line
- Send button (disabled when empty)
- Loading state while AI is responding (input disabled)
- Stop button appears during streaming

#### F4. Streaming Responses
**What:** AI responses appear token-by-token, not all at once.
**Details:**
- Smooth animation as text appears
- Cursor/blinking indicator at end of streaming text
- User can cancel mid-stream (stop button)
- Cancelled responses are not saved

#### F5. My Chats Tab
**What:** Separate tab showing all user conversations.
**Details:**
- List of all chats, sorted by last activity
- Each item shows: character avatar, name, last message preview, time ago
- Click to open/resume chat
- Swipe or long-press for actions: delete, rename
- Empty state: "No chats yet. Start one from the Gallery!"
- Search within chats (by character name or message content)

**User sees:**
```
┌─────────────────────────────────────────┐
│  [Gallery]  [My Chats]  [Characters]    │
├─────────────────────────────────────────┤
│  My Chats                        [🔍]   │
│                                         │
│  🕵️ Шерлок                              │
│  Элементарно. Скажите, когда вы...     │
│  2 min ago                              │
│  ─────────────────────────────────────  │
│  🧙 Мерлин                              │
│  Добро пожаловать, путник...           │
│  Yesterday                              │
│  ─────────────────────────────────────  │
│  🤖 AI Robot                            │
│  Hello! How can I help you?            │
│  3 days ago                             │
└─────────────────────────────────────────┘
```

#### F6. Character Config System
**What:** Characters defined by JSON files or database records.
**Details:**
- Each character = one JSON file (dev mode) or DB record (server mode)
- Fields: id, name, avatar, description, personality, systemPrompt, greeting, aiProvider, model, temperature, tags
- Adding a character = adding a file or creating via UI
- Config validation on load

#### F7. AI Provider Interface
**What:** Pluggable AI backend.
**Details:**
- Interface: `sendMessage()`, `streamMessage()`
- OpenAI implementation (MVP)
- Provider selected per character in config
- API key stored in settings (IndexedDB)

#### F8. Settings
**What:** Basic app configuration.
**Details:**
- API key input (OpenAI)
- Default model selection
- Theme toggle (light/dark)
- Clear all chats button
- Export/Import all data
- Settings saved to IndexedDB

#### F9. Character Search & Filter
**What:** Find characters by name, tags, description.
**Details:**
- Search bar on gallery
- Filter by tags (clickable tag pills)
- Real-time filtering
- "No results" state with suggestion

---

### Enhanced Features (Phase 2)

#### F10. Character Management (CRUD)
**What:** Create, edit, delete characters from the app.
**Details:**

**Create Character:**
- Form with fields: name, description, personality, system prompt, greeting, avatar upload, tags, model, temperature
- Preview card while editing
- Test chat button (quick test before saving)
- Validation: required fields, prompt length limits

**Edit Character:**
- Same form pre-filled with existing data
- Changes apply to new chats only (existing chats keep old config snapshot)
- Delete character (with confirmation, affects only new chats)

**Character List View:**
- Table/grid of all characters
- Sort by name, date created, popularity
- Bulk actions: delete, export

#### F11. AI-Assisted Character Creation
**What:** Quick character creation via AI prompt.
**Details:**
- User describes character in natural language: "Create a sarcastic cat who gives life advice"
- AI generates: name, description, personality, system prompt, greeting, suggested tags
- User reviews and edits before saving
- Option to regenerate individual fields
- Avatar suggestion (AI generates description for image generation)

**User flow:**
```
1. User clicks "Create with AI" button
2. Enters description: "A wise old turtle who speaks slowly and gives philosophical advice"
3. AI generates full character profile
4. User sees preview card + all fields editable
5. User tweaks if needed → saves
6. Character appears in gallery
```

#### F12. Character Profile
**What:** Detailed view of a character before chatting.
**Details:**
- Full description
- Personality traits
- Sample dialogue
- "Start Chat" button
- "Edit" button (for user-created characters)
- Back to gallery

#### F13. Chat Management
**What:** Organize and manage conversations.
**Details:**
- Rename chat
- Delete chat (with confirmation)
- Export chat as text/JSON file
- Pin important chats to top
- Search within chat (Ctrl+F)

#### F14. Message Actions
**What:** Interact with individual messages.
**Details:**
- Copy message text
- Regenerate response (retry)
- Edit user message (re-send with edit)
- Delete message
- Long-press context menu on mobile

#### F15. Theme System
**What:** Customizable appearance.
**Details:**
- Light / Dark / System theme
- Per-character accent colors
- Font size adjustment
- Compact / Comfortable message spacing

#### F16. Typing Indicator
**What:** Visual feedback while AI is "thinking".
**Details:**
- Animated dots or character-specific animation
- "Шерлок думает..." with character name
- Disappears when response starts streaming

#### F17. Error Handling
**What:** Graceful error recovery.
**Details:**
- API error → "Something went wrong. Retry?" button
- Network offline → "You're offline" banner
- Invalid API key → settings prompt
- Rate limit → countdown timer
- Retry with exponential backoff

---

### Advanced Features (Phase 3)

#### F18. Multi-Provider Support
**What:** Support multiple AI backends.
**Details:**
- OpenAI (GPT-4o, GPT-4o-mini)
- Anthropic (Claude)
- Local LLM (Ollama)
- Provider selection in settings
- Fallback chain (if primary fails)

#### F19. Voice Messages
**What:** Send and receive voice messages.
**Details:**
- Record voice message (browser microphone)
- Speech-to-text for user voice
- Text-to-speech for character responses
- Character-specific voice style

#### F20. Image Generation in Chat
**What:** Characters can generate images.
**Details:**
- Special command: `/image description`
- Character generates image via DALL-E / Stable Diffusion
- Image displayed inline in chat
- Download / full-screen view

#### F21. Character Memory
**What:** Characters remember past conversations.
**Details:**
- Long-term memory per character
- Memory summarization (condense old chats)
- Character references past conversations
- Memory persistence across sessions

#### F22. Multi-Language UI
**What:** App interface in multiple languages.
**Details:**
- i18n system (i18next)
- Auto-detect browser language
- Language switcher in settings
- Character prompts can be in any language

#### F23. Keyboard Shortcuts
**What:** Power user shortcuts.
**Details:**
- `Ctrl+K` — quick search characters
- `Ctrl+N` — new chat
- `Ctrl+/` — show shortcuts
- `Esc` — close modals
- `↑` — edit last message (when input empty)

---

## Data Storage Strategy

### Why NOT localStorage

| Issue | localStorage | IndexedDB (our choice) |
|-------|-------------|----------------------|
| Size limit | ~5-10MB | ~50MB-2GB (browser dependent) |
| Data types | Strings only | Any type (objects, blobs) |
| Performance | Synchronous (blocks UI) | Asynchronous (non-blocking) |
| Querying | Manual filtering | Indexes, cursors |
| Binary data | Base64 (inefficient) | Direct blob storage |

### IndexedDB Schema

```typescript
// Database: ai-chat-game
// Version: 1

// Store: characters
// Stores character configs (synced from JSON files or user-created)
{
  key: string (id),
  value: {
    id, name, avatar, description, personality,
    systemPrompt, greeting, aiProvider, model,
    temperature, maxTokens, tags, createdAt, updatedAt,
    isUserCreated: boolean
  }
}

// Store: chats
// Stores chat metadata
{
  key: string (id),
  value: {
    id, characterId, title, createdAt, updatedAt,
    messageCount, lastMessagePreview, isPinned: boolean
  }
}

// Store: messages
// Stores individual messages, indexed by chatId
{
  key: auto-increment,
  value: {
    id, chatId, role (user|assistant|system),
    content, timestamp, tokenCount
  },
  indexes: [
    { name: 'chatId', keyPath: 'chatId' },
    { name: 'chatTime', keyPath: ['chatId', 'timestamp'] }
  ]
}

// Store: settings
// Single-key store for app settings
{
  key: 'app-settings',
  value: {
    apiKey, defaultModel, theme, language,
    defaultTemperature, maxHistoryLength
  }
}

// Store: cache
// AI response cache
{
  key: string (hash),
  value: {
    response, characterId, userMessage,
    createdAt, expiresAt
  }
}
```

### Storage Library

Use **idb** (lightweight IndexedDB wrapper) or **Dexie.js** for cleaner API:

```typescript
import Dexie from 'dexie';

const db = new Dexie('ai-chat-game');
db.version(1).stores({
  characters: 'id, name, *tags',
  chats: 'id, characterId, updatedAt, isPinned',
  messages: '++id, chatId, timestamp',
  settings: 'key',
  cache: 'key, expiresAt'
});
```

### Estimated Storage Usage

| Data | Size per item | 1000 items |
|------|--------------|------------|
| Character config | ~2KB | 2MB |
| Chat metadata | ~500B | 500KB |
| Message (avg) | ~1KB | 1MB |
| Messages per chat (avg 50) | 50KB | 50MB |
| **Total (1000 chats)** | | **~55MB** |

Well within IndexedDB limits (~50MB-2GB depending on browser).

---

## Edge Cases & Error States

| Scenario | Behavior |
|----------|----------|
| No API key set | Prompt to enter key before first message |
| API rate limit | Show countdown, queue message |
| Network disconnect | "Offline" banner, queue messages |
| Invalid character config | Skip character, show warning |
| Empty chat history | Show character greeting |
| Very long chat | Virtual scrolling, load on demand |
| Character deleted while chatting | Show error, return to gallery |
| Storage full | Warn user, offer to export & clear old chats |
| Streaming interrupted | Show partial response, offer retry |
| IndexedDB not supported | Fallback to localStorage with warning |

---

## Non-Functional Requirements

| Requirement | Target |
|-------------|--------|
| Initial load time | <2s on 3G |
| Time to interactive | <3s |
| Bundle size | <200KB gzipped |
| Memory usage | <100MB (browser) |
| Storage capacity | ~50MB+ (IndexedDB) |
| Offline support | View cached chats, queue messages |
| Accessibility | WCAG 2.1 AA |
| Mobile support | iOS Safari, Chrome Android |
| Desktop support | Chrome, Firefox, Safari, Edge |

---

## Feature Priority Matrix

| Priority | Features | Timeline |
|----------|----------|----------|
| **P0 — Must have** | F1, F2, F3, F4, F5, F6, F7, F8, F9 | Phase 1 (MVP) |
| **P1 — Should have** | F10, F11, F14, F16, F17 | Phase 1.5 |
| **P2 — Nice to have** | F12, F13, F15, F23 | Phase 2 |
| **P3 — Future** | F18, F19, F20, F21, F22 | Phase 3 |
