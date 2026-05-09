# AI Chat Game

[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-cyan)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5-purple)](https://vitejs.dev/)
[![MIT License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

Web application where users can chat with AI characters featuring advanced memory system, character editor, and token analytics.

## 🎯 Features

### Core Features
- **Character Gallery** — Browse and select from a library of AI characters
- **Real-time Chat** — Stream responses token-by-token for natural conversation
- **Character Memory** — AI remembers facts about you across sessions
- **Character Editor** — Visual builder to create/edit characters without JSON editing
- **Token Dashboard** — Track usage, costs, and optimize spending
- **AI Image Generation** — Request characters to generate images (DALL·E 3 / Stable Diffusion)
- **Multi-provider Support** — OpenAI, Ollama, LM Studio, Groq, any OpenAI-compatible API
- **Import/Export** — Share characters via JSON, backup all data

### Character Library
- Pre-built characters: Detective (Sherlock), Wizard (Merlin), and more
- Categories: Fantasy, Sci-Fi, Historical, Comedy, Education, Roleplay
- Search by tags, filter by category, sort by popularity
- Community marketplace for sharing custom characters

### Advanced Memory System
- **Short-term**: Last 10 messages in full context
- **Long-term**: Auto-extracted facts stored per character
- **Manual control**: Add, edit, or forget specific memories
- **Smart retrieval**: Relevant memories injected into context automatically

### Token Analytics Dashboard
- Daily/weekly/monthly token usage
- Cost breakdown by model (gpt-4o-mini vs gpt-4o)
- Top characters by usage
- Spending projections and alerts
- Optimization recommendations

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Edit .env and add your API keys
# VITE_OPENAI_API_KEY=sk-...
# VITE_OLLAMA_BASE_URL=http://localhost:11434/v1

# Start development server
npm run dev

# Build for production
npm run build
```

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [Features](docs/FEATURES.md) | Detailed feature list and UX flows |
| [Architecture](docs/ARCHITECTURE.md) | System design and module breakdown |
| [AI Strategy](docs/AI_STRATEGY.md) | Token optimization techniques |
| [Character Editor Guide](docs/CHARACTER_EDITOR.md) | How to create compelling characters |
| [Token Dashboard](docs/TOKEN_DASHBOARD.md) | Usage tracking and cost optimization |
| [Deployment](docs/DEPLOYMENT.md) | Setup guide for local and cloud deployment |
| [Troubleshooting](docs/TROUBLESHOOTING.md) | Common issues and solutions |

## 🎨 Character Editor

Create custom characters through an intuitive visual interface:

1. **Basic Info**: Name, description, avatar upload
2. **Personality**: Tags and trait selectors
3. **System Prompt**: Textarea with live token counter
4. **Greeting**: First message the character sends
5. **Model Settings**: Provider, model, temperature slider
6. **Preview**: See how the character card looks
7. **Test Chat**: Quick test before saving
8. **Export/Import**: Share as JSON file

Best practices and templates available in [Character Editor Guide](docs/CHARACTER_EDITOR.md).

## 💰 Cost Optimization

Built-in strategies to minimize token costs:

- **Concise prompts**: System prompts optimized to <150 tokens
- **Context management**: Sliding window + auto-summarization
- **Model tiering**: Route simple queries to cheaper models
- **Response caching**: Identical questions get cached answers
- **Streaming cancel**: Stop generation early to save tokens
- **Local models**: Zero-cost option with Ollama/LM Studio

See [AI Strategy](docs/AI_STRATEGY.md) for detailed breakdown.

Expected costs with GPT-4o-mini: **~$0.20 per 1000 messages**

## 🏗️ Project Structure

```
ai-chat-game/
├── src/
│   ├── components/        # React components
│   │   ├── chat/          # ChatWindow, MessageBubble, MessageInput
│   │   ├── character/     # CharacterCard, CharacterEditor, CharacterGallery
│   │   ├── memory/        # MemoryViewer, MemoryEditor
│   │   ├── dashboard/     # TokenStats, UsageCharts
│   │   └── ui/            # Reusable primitives (Button, Modal, Avatar)
│   ├── pages/             # Home, Chat, Settings, CharacterEditor
│   ├── hooks/             # useChat, useCharacter, useMemory, useTokenStats
│   ├── services/          # AI providers, storage, image generation
│   ├── stores/            # Zustand state management
│   ├── types/             # TypeScript interfaces
│   └── utils/             # Helpers, tokenizers, validators
├── config/
│   ├── characters/        # Character JSON definitions
│   ├── ai-providers.json  # Provider configurations
│   └── themes.json        # UI themes
├── docs/                  # Documentation
└── public/                # Static assets
```

## 🔧 Configuration

### AI Providers

Configure multiple providers in `config/ai-providers.json`:

```json
{
  "providers": {
    "openai": {
      "baseUrl": "https://api.openai.com/v1",
      "apiKeyEnv": "VITE_OPENAI_API_KEY"
    },
    "ollama": {
      "baseUrl": "http://localhost:11434/v1",
      "apiKeyEnv": null
    },
    "lmstudio": {
      "baseUrl": "http://localhost:1234/v1",
      "apiKeyEnv": null
    }
  }
}
```

### Character Format

Each character is a JSON file in `config/characters/`:

```json
{
  "id": "detective",
  "name": "Шерлок",
  "description": "Гениальный детектив с острым умом",
  "personality": "analytical, observant, dry humor",
  "systemPrompt": "You are Sherlock Holmes. Analytical, observant, dry humor...",
  "greeting": "Ах, новый клиент. Проходите.",
  "model": "gpt-4o-mini",
  "temperature": 0.7,
  "tags": ["detective", "mystery", "smart"]
}
```

See [AI JSON Schema](docs/AI_JSON_SCHEMA.md) for full specification.

## 🌍 Multi-language Support

UI available in:
- English (default)
- Russian (Русский)
- More languages coming soon

Auto-detected from browser settings, can be changed in Settings.

## 📊 Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **State Management**: Zustand
- **Styling**: CSS Modules / Tailwind CSS
- **Storage**: IndexedDB (local-first)
- **AI Integration**: OpenAI SDK, fetch API
- **Charts**: Recharts
- **i18n**: i18next

## 🤝 Contributing

Contributions welcome! Please read our contributing guidelines first.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Issue Templates
- Bug Report
- Feature Request
- Character Submission

## 📝 License

MIT License — see [LICENSE](LICENSE) for details.

## 🙏 Acknowledgments

- Built with inspiration from Character.AI, Chub.ai, and open-source LLM community
- Thanks to all contributors and character creators