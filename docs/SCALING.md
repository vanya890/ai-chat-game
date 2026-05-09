# AI Chat Game — Scaling Considerations

## Design Philosophy

**Self-contained deployment.** No CDN, no external services required.
Works on a single laptop or a VPS — same codebase, one command to deploy.

---

## Target: Mode 2 — Single Server (Self-hosted)

This is our primary target. Good performance on one machine, easy to deploy.

```
┌─────────────────────────────────────────────────────┐
│  Single Server Deployment                           │
│                                                     │
│  ┌─────────────────────────────────────────────┐   │
│  │         Nginx / Caddy                       │   │
│  │    (static files + reverse proxy)           │   │
│  ├─────────────────────────────────────────────┤   │
│  │         Backend (Node.js)                   │   │
│  │                                             │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  │   │
│  │  │Character │  │  Chat    │  │ AI Proxy │  │   │
│  │  │ Service  │  │ Service  │  │ Service  │  │   │
│  │  └──────────┘  └──────────┘  └──────────┘  │   │
│  │                                             │   │
│  │  ┌──────────────────────────────────────┐  │   │
│  │  │  In-memory cache (LRU)               │  │   │
│  │  │  (no Redis needed for <10K users)    │  │   │
│  │  └──────────────────────────────────────┘  │   │
│  ├─────────────────────────────────────────────┤   │
│  │         SQLite (default)                    │   │
│  │  (characters, users, chats, cache)          │   │
│  │  PostgreSQL — optional, drop-in replace     │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
│  One docker-compose up. That's it.                 │
└─────────────────────────────────────────────────────┘
```

---

## Performance on Single Server

### Character Management (100K+ characters)

**Problem:** Loading all character configs at startup is slow.

**Solution: Index + lazy loading**

```json
// config/characters-index.json — loaded at startup (~50KB for 10K chars)
{
  "characters": [
    { "id": "detective", "name": "Шерлок", "tags": ["detective"], "avatar": "/avatars/detective.png" },
    { "id": "wizard", "name": "Мерлин", "tags": ["fantasy"], "avatar": "/avatars/wizard.png" }
  ],
  "total": 150000
}
```

Full config loaded only when user selects a character:
```typescript
const character = await fetch(`/api/characters/${id}`);
```

**Database schema (SQLite):**
```sql
CREATE TABLE characters (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  avatar TEXT,
  description TEXT,
  personality TEXT,
  system_prompt TEXT,
  greeting TEXT,
  ai_provider TEXT,
  model TEXT,
  temperature REAL,
  max_tokens INTEGER,
  tags TEXT,  -- JSON array
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_characters_tags ON characters(tags);
CREATE INDEX idx_characters_name ON characters(name);
```

### Chat History

**Problem:** localStorage limited to ~5-10MB.

**Solution:** Server-side storage with pagination.

```sql
CREATE TABLE chats (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  character_id TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE messages (
  id TEXT PRIMARY KEY,
  chat_id TEXT REFERENCES chats(id),
  role TEXT NOT NULL,  -- 'user' | 'assistant' | 'system'
  content TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_messages_chat ON messages(chat_id, created_at);
```

### AI Proxy + Caching

**Problem:** Each message = API call = slow + expensive.

**Solution:** Backend proxy with in-memory cache.

```typescript
// LRU cache — no Redis needed for single server
const responseCache = new LRUCache({ max: 1000 });

async function sendMessage(character: Character, userMessage: string) {
  const cacheKey = hash(character.id + userMessage);
  
  const cached = responseCache.get(cacheKey);
  if (cached) return cached;
  
  const response = await aiProvider.sendMessage(...);
  responseCache.set(cacheKey, response);
  return response;
}
```

### Search

**Problem:** Client-side filtering is slow with many characters.

**Solution:** SQLite full-text search.

```sql
CREATE VIRTUAL TABLE characters_fts USING fts5(
  name, description, personality, tags,
  content='characters'
);

-- Search query
SELECT * FROM characters_fts WHERE characters_fts MATCH 'detective british';
```

---

## Deployment

### docker-compose.yml

```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    volumes:
      - ./data:/app/data        # SQLite database
      - ./config:/app/config    # Character configs
      - ./avatars:/app/avatars  # Character images
    environment:
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - NODE_ENV=production
    restart: unless-stopped
```

That's it. One file, one command.

### Resource Requirements

| Metric | Value |
|--------|-------|
| RAM | 256MB (idle) — 512MB (under load) |
| CPU | 1 core sufficient |
| Disk | ~100MB + database size |
| Database | SQLite file, auto-managed |

---

## AI Cost Optimization

**1. Response Caching:**
- Cache identical prompts (same character + same user message)
- LRU cache, 1000 entries (~5MB RAM)

**2. Streaming with cancellation:**
- User can cancel mid-response
- Don't pay for tokens user didn't read

**3. Model tiering:**
- Simple responses → cheaper model (gpt-4o-mini)
- Complex reasoning → expensive model (gpt-4o)

---

## Migration Path

### Phase 1 (Current): Client-only MVP
- JSON configs, localStorage, direct API calls
- **Zero setup** — just open in browser
- Good for: personal use, demo, <100 characters

### Phase 2: Single Server (our target)
- Backend serves static files + API
- SQLite by default (zero config), PostgreSQL optional
- Character index + lazy loading + FTS search
- In-memory LRU cache (no Redis)
- **One command:** `docker-compose up`
- Good for: self-hosted, <100K characters, <10K users

### Phase 3 (Future, theoretical): Multi-server
- Same codebase, add replicas + load balancer
- PostgreSQL cluster, Redis for distributed cache
- Only needed if single server can't handle the load

---

## Performance Targets (Single Server)

| Metric | Target |
|--------|--------|
| Character list load | <200ms (indexed query) |
| Character search | <100ms (FTS) |
| Character detail load | <50ms (single row query) |
| First message response | 500ms-2s (cached/proxy) |
| Chat history load | <200ms (paginated, 50 messages) |
| Initial bundle size | <100KB (code split) |
| Memory usage | <512MB |

---

## What to Build NOW (MVP)

Don't over-engineer yet. The current architecture is correct for Phase 1:

1. ✅ JSON configs — easy to add characters
2. ✅ Provider interface — swap backends later
3. ✅ Modular layers — extract to services later
4. ✅ Zustand — replace with server state later

**When to add server mode:**
- When character count > 500 → add index + lazy loading + SQLite
- When users > 1 → add backend
- When AI costs > $100/mo → add caching + proxy

*Build the MVP first. The architecture is designed to scale to single-server mode — each layer can be replaced independently. Same codebase, different deployment modes.*
