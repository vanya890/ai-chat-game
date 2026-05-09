# AI Chat Game — Deployment Guide

## Overview

This guide covers deployment options for AI Chat Game, from local development to production hosting. Choose the approach that fits your needs.

## 🚀 Quick Start (Local Development)

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Git

### Installation

```bash
# Clone repository
git clone https://github.com/your-org/ai-chat-game.git
cd ai-chat-game

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Edit .env with your settings
nano .env
```

### Environment Configuration

Minimum `.env` for local development:

```bash
# OpenAI API (optional - can use local models instead)
VITE_OPENAI_API_KEY=sk-your-key-here

# Ollama (optional - for local free models)
VITE_OLLAMA_BASE_URL=http://localhost:11434/v1

# LM Studio (alternative local option)
VITE_LMSTUDIO_BASE_URL=http://localhost:1234/v1
```

### Run Development Server

```bash
npm run dev
```

App opens at `http://localhost:5173`

---

## 💻 Local Models Setup

### Option 1: Ollama (Recommended)

**Install Ollama:**

macOS:
```bash
curl -fsSL https://ollama.ai/install.sh | sh
```

Linux:
```bash
curl -fsSL https://ollama.ai/install.sh | sh
```

Windows:
Download from https://ollama.ai/download

**Pull a model:**
```bash
ollama pull llama3.2
ollama pull mistral
ollama pull codellama  # For coding assistance
```

**Configure in app:**
```json
// config/ai-providers.json
{
  "providers": {
    "ollama": {
      "name": "Ollama",
      "baseUrl": "http://localhost:11434/v1",
      "apiKeyEnv": null,
      "models": {
        "llama3.2": {
          "name": "Llama 3.2",
          "maxTokens": 4096,
          "costPer1kTokens": 0
        }
      }
    }
  }
}
```

**Benefits:**
- ✅ Completely free
- ✅ No API keys needed
- ✅ Full privacy (everything local)
- ✅ Unlimited usage

**Trade-offs:**
- ⚠️ Requires GPU for good performance
- ⚠️ Model quality varies vs GPT-4
- ⚠️ Uses local resources

### Option 2: LM Studio

**Install LM Studio:**
1. Download from https://lmstudio.ai
2. Install and launch
3. Download a model from the hub
4. Start local server

**Configuration:**
```bash
VITE_LMSTUDIO_BASE_URL=http://localhost:1234/v1
```

**Benefits:**
- User-friendly GUI
- Wide model selection
- Built-in benchmarking

### Option 3: Other Local Options

**AnythingLLM:**
- Docker-based
- Multi-user support
- Document RAG capabilities

**LocalAI:**
- OpenAI-compatible API
- Self-hosted
- Multiple model backends

---

## 🌐 Production Deployment

### Option 1: Static Hosting (Recommended for most users)

**Build for production:**
```bash
npm run build
```

Output in `dist/` folder (~100-200KB gzipped).

#### Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

**vercel.json:**
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/" }
  ],
  "env": {
    "VITE_OPENAI_API_KEY": "@openai-api-key"
  }
}
```

Add secrets in Vercel dashboard.

#### Deploy to Netlify

```bash
# Install Netlify CLI
npm i -g netlify-cli

# Build and deploy
npm run build
netlify deploy --prod
```

**.env in Netlify dashboard:**
```
VITE_OPENAI_API_KEY = sk-...
VITE_APP_NAME = AI Chat Game
```

#### Deploy to GitHub Pages

```bash
# Install gh-pages
npm i -D gh-pages

# Add to package.json scripts
"deploy": "npm run build && gh-pages -d dist"

# Deploy
npm run deploy
```

**Note:** GitHub Pages is static-only. Users need their own API keys.

### Option 2: Docker Deployment

**Dockerfile:**
```dockerfile
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**nginx.conf:**
```nginx
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

**Build and run:**
```bash
docker build -t ai-chat-game .
docker run -p 80:80 ai-chat-game
```

**Docker Compose (with Ollama):**
```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "80:80"
    environment:
      - VITE_OLLAMA_BASE_URL=http://ollama:11434/v1
    depends_on:
      - ollama

  ollama:
    image: ollama/ollama:latest
    ports:
      - "11434:11434"
    volumes:
      - ollama_data:/root/.ollama
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: all
              capabilities: [gpu]

volumes:
  ollama_data:
```

Run:
```bash
docker-compose up -d
```

### Option 3: VPS Deployment

**Requirements:**
- Ubuntu 22.04+ server
- 2GB+ RAM
- Domain name (optional)

**Setup script:**

```bash
#!/bin/bash
# deploy.sh

# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install nginx
sudo apt install -y nginx

# Clone app
git clone https://github.com/your-org/ai-chat-game.git
cd ai-chat-game

# Install dependencies
npm install

# Build
npm run build

# Configure nginx
sudo cp nginx.conf /etc/nginx/sites-available/ai-chat-game
sudo ln -s /etc/nginx/sites-available/ai-chat-game /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# Setup SSL (optional)
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

**Systemd service:**

```ini
# /etc/systemd/system/ai-chat-game.service
[Unit]
Description=AI Chat Game
After=network.target

[Service]
Type=oneshot
ExecStart=/usr/bin/npm run build
WorkingDirectory=/var/www/ai-chat-game
RemainAfterExit=yes

[Install]
WantedBy=multi-user.target
```

---

## 🔒 Security Considerations

### API Key Management

**Never commit API keys:**

```bash
# Add to .gitignore
.env
.env.local
.env.production
```

**Use environment variables:**

```typescript
// src/config.ts
const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

if (!apiKey) {
  console.warn('OpenAI API key not configured');
}
```

### Rate Limiting

Protect against abuse:

```typescript
// Simple rate limiter
const rateLimit = {
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 20,     // per minute
  
  check(userId: string): boolean {
    // Implement tracking
  }
};
```

### CORS Configuration

For backend proxy (if used):

```javascript
// Express example
app.use(cors({
  origin: ['https://your-domain.com'],
  credentials: true
}));
```

### Content Security Policy

Add meta tag:

```html
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';">
```

---

## 📊 Monitoring & Logging

### Client-side Analytics

Track usage without backend:

```typescript
// src/services/analytics.ts
import { posthog } from 'posthog-js';

posthog.init('your-project-key', {
  api_host: 'https://app.posthog.com'
});

export function trackEvent(name: string, properties?: object) {
  posthog.capture(name, properties);
}
```

### Error Tracking

**Sentry integration:**

```bash
npm install @sentry/react
```

```typescript
// src/main.tsx
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "your-sentry-dsn",
  environment: import.meta.env.MODE,
  tracesSampleRate: 0.1,
});
```

### Performance Monitoring

**Web Vitals:**

```typescript
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

getCLS(console.log);
getFID(console.log);
getFCP(console.log);
getLCP(console.log);
getTTFB(console.log);
```

---

## 🔄 CI/CD Pipeline

### GitHub Actions

**.github/workflows/deploy.yml:**

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '20'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run tests
      run: npm test
    
    - name: Build
      run: npm run build
      env:
        VITE_OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
    
    - name: Deploy to Vercel
      uses: amondnet/vercel-action@v20
      with:
        vercel-token: ${{ secrets.VERCEL_TOKEN }}
        vercel-org-id: ${{ secrets.ORG_ID }}
        vercel-project-id: ${{ secrets.PROJECT_ID }}
        working-directory: ./
```

### Automated Testing

```yaml
# Add to workflow
- name: Run E2E tests
  run: npm run test:e2e
  
- name: Upload test results
  uses: actions/upload-artifact@v3
  with:
    name: test-results
    path: test-results/
```

---

## 🎯 Environment-Specific Configs

### Development (.env.development)

```bash
VITE_APP_ENV=development
VITE_API_URL=http://localhost:3000
VITE_DEBUG=true
VITE_LOG_LEVEL=debug
```

### Production (.env.production)

```bash
VITE_APP_ENV=production
VITE_API_URL=https://api.your-domain.com
VITE_DEBUG=false
VITE_LOG_LEVEL=error
VITE_SENTRY_DSN=your-sentry-dsn
```

### Staging (.env.staging)

```bash
VITE_APP_ENV=staging
VITE_API_URL=https://staging-api.your-domain.com
VITE_DEBUG=true
VITE_LOG_LEVEL=warn
```

---

## 📦 Backup & Recovery

### Export User Data

```typescript
// src/services/backup.ts
export async function exportAllData(): Promise<Blob> {
  const data = {
    chats: await db.chats.toArray(),
    characters: await db.characters.toArray(),
    settings: await db.settings.toArray(),
    exportedAt: new Date().toISOString()
  };
  
  return new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json'
  });
}

export async function importData(file: File): Promise<void> {
  const text = await file.text();
  const data = JSON.parse(text);
  
  // Validate and import
  await db.transaction('rw', db.chats, db.characters, async () => {
    await db.chats.bulkPut(data.chats);
    await db.characters.bulkPut(data.characters);
    await db.settings.bulkPut(data.settings);
  });
}
```

### Scheduled Backups

```bash
# Cron job for server backups
0 2 * * * /usr/local/bin/backup-ai-chat.sh
```

**backup-ai-chat.sh:**
```bash
#!/bin/bash
DATE=$(date +%Y-%m-%d)
tar -czf /backups/ai-chat-$DATE.tar.gz /var/www/ai-chat-game
find /backups -mtime +30 -delete  # Keep 30 days
```

---

## 🔧 Troubleshooting

### Problem: Build fails in production

**Common causes:**
1. Missing environment variables
2. TypeScript errors
3. Dependency issues

**Solution:**
```bash
# Check types
npm run type-check

# Verify env vars
echo $VITE_OPENAI_API_KEY

# Clean install
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Problem: App works locally but not deployed

**Check:**
1. Base URL configuration
2. CORS settings
3. API key exposure
4. Routing (SPA rewrites)

**Debug:**
```javascript
// Add to app
console.log('API Key configured:', !!import.meta.env.VITE_OPENAI_API_KEY);
console.log('Base URL:', import.meta.env.BASE_URL);
```

### Problem: Slow performance

**Optimizations:**
1. Enable compression on server
2. Use CDN for static assets
3. Lazy load components
4. Optimize images

```bash
# Check bundle size
npm run build -- --stats
npx webpack-bundle-analyzer dist/stats.json
```

---

## 📚 Related Documentation

- [Features](FEATURES.md) — Complete feature list
- [Architecture](ARCHITECTURE.md) — System design
- [Token Dashboard](TOKEN_DASHBOARD.md) — Usage tracking
- [Troubleshooting](TROUBLESHOOTING.md) — Common issues

---

**Deploy successfully and happy chatting!** 🚀
