# AI Chat Game — Scaling Considerations

## Design Philosophy

**Self-contained deployment.** No CDN, no external services required.
Works on a single laptop, a VPS, or a cluster — same codebase.

---

## Current Architecture Limits

| Component | Current Approach | Limit | Problem at Scale |
|-----------|-----------------|-------|------------------|
| Characters | JSON files in repo | ~100 chars | Loading all at startup is slow |
| Chat History | localStorage | ~5-10MB total | Can't store many chats |
| AI Requests | Direct from browser | Rate limits | No caching, no pooling |
| Assets | Static files | Bundle size | Slow initial load |

---

## Scaling to 100K+ Characters

### Problem: Loading all character configs at startup

### Solution: On-demand loading + indexing

**1. Character Index (small, loaded at startup):**
```json
// config/characters-index.json
{
  "characters": [
    { "id": "detective", "name": "Шерлок", "tags": ["detective"], "avatar": "/avatars/detective.png" },
    { "id": "wizard", "name": "Мерлин", "tags": ["fantasy"], "avatar": "/avatars/wizard.png" }
  ],
  "total": 150000,
  "lastUpdated": "2026-05-09"
}
```

**2. Full config loaded only when selected:**
```typescript
// Lazy load — fetch only what's needed
const character = await fetch(`/api/characters/${id}`);
```

**3. Pagination + search:**
- Index file split into chunks (by letter, category, or page)
- Search via API endpoint, not client-side filtering
- Static file serving (no CDN needed)

---

## Scaling to 100K+ Users

### Deployment Modes

```
┌─────────────────────────────────────────────────────┐
│  Mode 1: Single Device (MVP)                        │
│  ┌─────────────────────────────────────────────┐   │
│  │              Browser (React App)             │   │
│  │  localStorage  │  Direct API calls          │   │
│  └─────────────────────────────────────────────┘   │
│  No server needed. Works offline.                  │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│  Mode 2: Single Server (Self-hosted)                │
│  ┌─────────────────────────────────────────────┐   │
│  │              Nginx / Caddy                   │   │
│  │         (static files + reverse proxy)       │   │
│  ├─────────────────────────────────────────────┤   │
│  │              Backend (Node.js)               │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  │   │
│  │  │Character │  │  Chat    │  │ AI Proxy │  │   │
│  │  │ Service  │  │ Service  │  │ Service  │  │   │
│  │  └──────────┘  └──────────┘  └──────────┘  │   │
│  ├─────────────────────────────────────────────┤   │
│  │              SQLite / PostgreSQL             │   │
│  │  (characters, users, chats, cache)          │   │
│  └─────────────────────────────────────────────┘   │
│  One docker-compose up. That's it.                 │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│  Mode 3: Multi-server (Production)                  │
│  Same codebase, just add replicas + load balancer   │
│  PostgreSQL cluster, Redis for cache                │
└─────────────────────────────────────────────────────┘
```

### Key Changes for Scale:

| Area | MVP (client-only) | Server mode |
|------|-------------------|-------------|
| Character storage | JSON files | SQLite/PostgreSQL |
| Chat history | localStorage | Database |
| AI requests | Browser → OpenAI | Backend proxy |
| Auth | None | JWT / session |
| Caching | None | In-memory / Redis |
| Search | Client-side filter | DB full-text search |

---

## AI Cost Optimization at Scale

### Problem: Each message = API call = $$$

### Solutions:

**1. Response Caching (server-side):**
```typescript
// Cache identical prompts (same character + same user message)
const cacheKey = hash(character.id + userMessage);
const cached = await cache.get(cacheKey);
if (cached) return cached;
```

**2. Streaming with cancellation:**
- User can cancel mid-response
- Don't pay for tokens user didn't read

**3. Model tiering:**
- Simple responses → cheaper model (gpt-4o-mini)
- Complex reasoning → expensive model (gpt-4o)
- Auto-detect based on message complexity

**4. Local fallback:**
- Cache frequent responses
- Use smaller model for common greetings

---

## Migration Path: MVP → Production

### Phase 1 (Current): Client-only
- JSON configs, localStorage, direct API calls
- Good for: personal use, demo, <100 characters
- **Zero setup** — just open index.html

### Phase 2: Server mode (same codebase)
- Backend serves static files + API
- SQLite by default (zero config), PostgreSQL optional
- Character index + lazy loading
- Good for: self-hosted, <10K characters, small teams
- **One command:** `docker-compose up`

### Phase 3: Multi-server
- Same codebase, add replicas
- PostgreSQL cluster, Redis for cache
- Good for: production, 100K+ users

---

## Performance Targets

| Metric | MVP | Server mode |
|--------|-----|-------------|
| Character list load | <1s (all in bundle) | <200ms (indexed) |
| Character detail load | Instant (local) | <100ms (DB query) |
| First message response | 1-3s (direct API) | 500ms-2s (cached/proxy) |
| Chat history load | Instant (local) | <300ms (paginated) |
| Initial bundle size | <200KB | <100KB (code split) |

---

## What to Build NOW (MVP)

Don't over-engineer yet. The current architecture is correct for Phase 1:

1. ✅ JSON configs — easy to add characters
2. ✅ Provider interface — swap backends later
3. ✅ Modular layers — extract to services later
4. ✅ Zustand — replace with server state later

**When to refactor:**
- When character count > 500 → add index + lazy loading
- When users > 100 → add backend
- When AI costs > $100/mo → add caching + proxy

*Build the MVP first. The architecture is designed to scale — each layer can be replaced independently. Same codebase, different deployment modes.*