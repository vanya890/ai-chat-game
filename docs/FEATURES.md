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

#### F7.5 Полная совместимость с любыми OpenAI-compatible моделями (Высокий приоритет)

**Что:** Полноценная работа со всеми моделями через OpenAI-совместимый API.
**Детали:**
- Единый интерфейс `AIProvider` с поддержкой `baseURL`.
- Поддержка: OpenAI, Ollama, LM Studio, AnythingLLM, Groq, LocalAI и любых других совместимых серверов.
- Автоматическое обнаружение моделей на локальном сервере.
- Настройки: baseUrl, model, apiKey (опционально для локальных).
- Приоритет локальных моделей для нулевых затрат и максимальной приватности.
- Mock-провайдер для разработки без запущенного LLM-сервера.
- Seamless переключение между облачными и локальными провайдерами.

**Преимущества:**
- Нулевые затраты при использовании Ollama/LM Studio.
- Полная конфиденциальность (локальные модели).
- Неограниченный контекст (зависит от hardware).

#### F21. Character Memory System (Продвинутая память персонажей)

**Что:** Персонажи запоминают информацию о пользователе и прошлых разговорах.
**Детали:**

**Краткосрочная память (Short-term):**
- Последние N сообщений в контексте чата.
- Sliding window + summarization старых сообщений.

**Долгосрочная память (Long-term):**
- Хранение ключевых фактов о пользователе для каждого персонажа (в IndexedDB).
- Автоматическая экстракция фактов после важных сообщений.
- Пользователь может вручную добавлять/редактировать/удалять воспоминания.
- Воспоминания автоматически добавляются в system prompt при необходимости.

**Реализация:**
- Vector search (опционально, через embeddings) для релевантных воспоминаний.
- Простое key-value хранилище для начала.
- Персонаж ссылается на прошлые события естественно.
- Опция "Forget" для отдельных фактов или всего чата.

**Пользователь видит:**
- Кнопку "Memory" в профиле персонажа.
- Список сохранённых фактов с возможностью редактирования.

---

(Остальные разделы без изменений)

## Non-Functional Requirements

| Требование                  | Цель                              |
|-----------------------------|-----------------------------------|
| Поддержка OpenAI-compatible | Полная совместимость с любыми LLM |
| Система памяти              | Краткосрочная + долгосрочная      |
| Мультиязычность UI          | Русский + English + автоопределение |