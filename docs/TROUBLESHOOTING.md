# AI Chat Game — Troubleshooting Guide

## Overview

This guide covers common issues and their solutions. If your problem isn't listed here, check the GitHub Issues or create a new one.

---

## 🔌 API & Connection Issues

### Problem: "API Key not configured" error

**Symptoms:**
- Red error banner at top of app
- Cannot send messages
- Console shows `VITE_OPENAI_API_KEY is undefined`

**Solutions:**

1. **Check .env file exists:**
```bash
ls -la .env
```

2. **Verify key format:**
```bash
# Correct
VITE_OPENAI_API_KEY=sk-proj-abc123...

# Wrong (missing VITE_ prefix)
OPENAI_API_KEY=sk-proj-abc123...

# Wrong (extra quotes)
VITE_OPENAI_API_KEY="sk-proj-abc123..."
```

3. **Restart dev server:**
```bash
# Stop current server (Ctrl+C)
npm run dev
```

4. **For production builds:**
Environment variables must be set at build time:
```bash
VITE_OPENAI_API_KEY=sk-... npm run build
```

### Problem: Cannot connect to Ollama

**Symptoms:**
- "Failed to fetch" error
- Ollama models not appearing
- Timeout errors

**Solutions:**

1. **Verify Ollama is running:**
```bash
ollama list
# Should show installed models
```

2. **Check CORS settings (Ollama):**
```bash
# Set environment variable before starting Ollama
OLLAMA_ORIGINS="*" ollama serve

# Or on macOS/Linux in ~/.zshrc or ~/.bashrc
export OLLAMA_ORIGINS="*"
```

3. **Verify URL in config:**
```json
// config/ai-providers.json
{
  "baseUrl": "http://localhost:11434/v1"
}
```

4. **Test connection:**
```bash
curl http://localhost:11434/api/tags
# Should return JSON with model list
```

5. **Check firewall:**
```bash
# Allow port 11434
sudo ufw allow 11434
```

### Problem: LM Studio connection fails

**Symptoms:**
- Connection refused
- 404 errors
- Models not loading

**Solutions:**

1. **Start local server in LM Studio:**
   - Open LM Studio
   - Go to "Local Server" tab
   - Click "Start Server"
   - Note the port (default: 1234)

2. **Enable CORS in LM Studio:**
   - Settings → Server
   - Check "Enable CORS"

3. **Update config:**
```json
{
  "baseUrl": "http://localhost:1234/v1",
  "models": {
    "your-model-name": { ... }
  }
}
```

---

## 💾 Storage & Data Issues

### Problem: Chats not saving

**Symptoms:**
- Messages disappear after refresh
- "My Chats" tab is empty
- Console shows IndexedDB errors

**Solutions:**

1. **Check browser storage:**
```javascript
// In browser console
navigator.storage.estimate().then(console.log);
// Check if quota exceeded
```

2. **Clear and reset:**
```javascript
// In browser console
indexedDB.deleteDatabase('ai-chat-game');
location.reload();
```

3. **Try different browser:**
Some browsers have strict storage limits in incognito/private mode.

4. **Export data regularly:**
Settings → Export Data → Download backup

### Problem: Import fails

**Symptoms:**
- "Invalid file format" error
- Nothing happens on import
- Partial data imported

**Solutions:**

1. **Verify JSON structure:**
```json
{
  "id": "character-id",
  "name": "Character Name",
  // ... other required fields
}
```

2. **Check file encoding:**
File must be UTF-8 encoded.

3. **Validate JSON:**
```bash
# Online validators or
node -e "console.log(JSON.parse(require('fs').readFileSync('file.json')))"
```

4. **File size limit:**
Max import size is 10MB. Split large exports.

### Problem: Characters missing after update

**Symptoms:**
- Custom characters disappeared
- Only default characters shown
- Console shows migration errors

**Solutions:**

1. **Check version compatibility:**
```javascript
// In browser console
localStorage.getItem('app-version');
```

2. **Manual migration:**
```javascript
// Import old characters manually
const oldChars = JSON.parse(localStorage.getItem('characters'));
// Then use Import feature
```

3. **Restore from backup:**
Settings → Import Data → Select backup file

---

## 💬 Chat & Messaging Issues

### Problem: Responses are cut off mid-sentence

**Symptoms:**
- Messages end abruptly
- "... [truncated]" appears
- Incomplete thoughts

**Solutions:**

1. **Increase maxTokens:**
```json
// Character config
{
  "maxTokens": 500  // Increase from default 300
}
```

2. **Check model limits:**
Some models have lower token limits. Switch to a model with higher context.

3. **Reduce context size:**
Long histories leave less room for responses. Clear old messages or start new chat.

### Problem: AI breaks character

**Symptoms:**
- "As an AI language model..." responses
- Out-of-character answers
- References to being an assistant

**Solutions:**

1. **Strengthen system prompt:**
```
Add: "Stay in character at all times. Never mention you are an AI. 
If unsure, respond in character rather than breaking the fourth wall."
```

2. **Lower temperature:**
```json
{
  "temperature": 0.5  // More consistent, less creative
}
```

3. **Add few-shot examples:**
```
System prompt addition:
"Example interactions:
User: Who are you?
You: I am Sherlock Holmes, the world's only consulting detective.
User: Are you real?
You: As real as the game requires me to be."
```

### Problem: Very slow responses

**Symptoms:**
- Long delay before typing starts
- 10+ seconds per message
- Timeout errors

**Solutions:**

1. **Check network speed:**
```bash
speedtest-cli  # Install first
```

2. **Switch to faster model:**
```json
{
  "model": "gpt-4o-mini"  // Instead of gpt-4o
}
```

3. **Use local models:**
Ollama with GPU acceleration can be faster than API calls.

4. **Reduce message history:**
Clear old messages or start new chat.

5. **Check API status:**
https://status.openai.com/

### Problem: Streaming doesn't work

**Symptoms:**
- Entire response appears at once
- No typing animation
- Buffering then dump

**Solutions:**

1. **Verify streaming support:**
Not all providers support streaming. Check provider docs.

2. **Check browser compatibility:**
Streaming requires modern browsers with Fetch API support.

3. **Disable browser extensions:**
Some ad blockers interfere with streaming.

4. **Server-side buffering:**
If using proxy, ensure it's not buffering responses.

---

## 🎨 UI & Display Issues

### Problem: Avatars not showing

**Symptoms:**
- Broken image icons
- Default placeholder shown
- 404 errors in console

**Solutions:**

1. **Check image path:**
```json
{
  "avatar": "/avatars/detective.png"  // Must be in public folder
}
```

2. **Verify file exists:**
```bash
ls public/avatars/
```

3. **Check file format:**
Supported: PNG, JPG, JPEG, WebP, GIF

4. **Image size:**
Recommended: 256x256px square
Max: 2MB

### Problem: Dark mode broken

**Symptoms:**
- Theme toggle doesn't work
- Colors look wrong
- Flash of wrong theme on load

**Solutions:**

1. **Clear localStorage:**
```javascript
localStorage.removeItem('theme');
location.reload();
```

2. **Check system preferences:**
App may be following OS theme settings.

3. **Browser cache:**
Hard refresh: Ctrl+Shift+R (Cmd+Shift+R on Mac)

### Problem: Mobile layout issues

**Symptoms:**
- Elements overlap
- Can't scroll properly
- Buttons too small

**Solutions:**

1. **Update browser:**
Old mobile browsers may lack CSS features.

2. **Zoom level:**
Reset zoom to 100%.

3. **Rotate device:**
Some layouts work better in landscape.

4. **Report bug:**
Include device model and browser version in issue report.

---

## 💰 Token & Cost Issues

### Problem: Costs higher than expected

**Symptoms:**
- Dashboard shows unexpected charges
- Token counts seem inflated
- Monthly projection too high

**Solutions:**

1. **Review usage breakdown:**
Dashboard → Cost by Model → Identify expensive models

2. **Check for loops:**
Buggy code might send repeated requests.

3. **Verify pricing:**
```json
// config/ai-providers.json
{
  "costPer1kTokens": 0.00015  // Verify current pricing
}
```

4. **Enable caching:**
Duplicate questions should use cached responses.

5. **Switch to cheaper models:**
Use gpt-4o-mini instead of gpt-4o for casual chat.

### Problem: Token dashboard not updating

**Symptoms:**
- Counts stuck at zero
- Charts not rendering
- Last updated timestamp old

**Solutions:**

1. **Force refresh:**
Dashboard → Refresh button (top right)

2. **Check IndexedDB:**
```javascript
// In console
const request = indexedDB.open('ai-chat-game');
request.onsuccess = () => {
  const db = request.result;
  const tx = db.transaction('tokenStats', 'readonly');
  tx.objectStore('tokenStats').count().addEventListener('success', console.log);
};
```

3. **Rebuild stats:**
Settings → Advanced → Rebuild Analytics

---

## 🔧 Build & Development Issues

### Problem: TypeScript errors

**Common errors:**

**"Cannot find module"**
```bash
# Install types
npm install --save-dev @types/react @types/node

# Regenerate types
npm run type-check
```

**"Property does not exist on type"**
```typescript
// Add type assertion
const element = document.getElementById('my-id') as HTMLElement;

// Or define proper interface
interface MyType {
  myProperty: string;
}
```

### Problem: Build fails

**Symptoms:**
- `npm run build` exits with error
- Dist folder not created
- Vite error messages

**Solutions:**

1. **Check Node version:**
```bash
node --version  # Should be 18+
```

2. **Clean install:**
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

3. **Check disk space:**
```bash
df -h  # Ensure >1GB free
```

4. **Verbose output:**
```bash
npm run build -- --debug
```

### Problem: Hot reload not working

**Symptoms:**
- Changes don't appear in browser
- Manual refresh required
- Vite HMR errors in console

**Solutions:**

1. **Restart dev server:**
```bash
# Ctrl+C, then
npm run dev
```

2. **Check file watchers:**
```bash
# Linux
ulimit -n  # Should be >10000

# Increase if needed
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

3. **Disable HMR temporarily:**
```javascript
// vite.config.ts
export default {
  server: {
    hmr: false
  }
}
```

---

## 🌐 Browser Compatibility

### Supported Browsers

| Browser | Version | Status |
|---------|---------|--------|
| Chrome | 90+ | ✅ Fully supported |
| Firefox | 88+ | ✅ Fully supported |
| Safari | 14+ | ✅ Fully supported |
| Edge | 90+ | ✅ Fully supported |
| Opera | 76+ | ⚠️ Limited support |
| IE 11 | Any | ❌ Not supported |

### Polyfills

For older browsers, add polyfills:

```html
<!-- In index.html -->
<script src="https://polyfill.io/v3/polyfill.min.js"></script>
```

---

## 📱 Platform-Specific Issues

### iOS Safari

**Problem:** Keyboard covers input

**Solution:**
```css
/* Add to CSS */
@media (max-width: 768px) {
  .message-input-container {
    padding-bottom: env(safe-area-inset-bottom);
  }
}
```

### Android Chrome

**Problem:** Address bar interference

**Solution:**
Use PWA with `display: standalone` in manifest.

### Desktop Apps

**Problem:** Running as Electron app

**Solution:**
Ensure CSP allows required features:
```javascript
// electron main.js
webPreferences: {
  contextIsolation: true,
  nodeIntegration: false
}
```

---

## 🆘 Getting Help

### Before Reporting a Bug

1. ✅ Search existing issues
2. ✅ Try troubleshooting steps above
3. ✅ Test in different browser
4. ✅ Clear cache and reload
5. ✅ Check console for errors

### How to Report a Bug

**Include:**

1. **Description:** What happened vs what you expected
2. **Steps to reproduce:** Exact steps
3. **Environment:**
   - Browser & version
   - OS
   - Device (if mobile)
4. **Screenshots:** If applicable
5. **Console errors:** Copy full error text
6. **Network tab:** Request/response details

**Example report:**
```
Title: Chat messages disappear after page refresh

Description:
When I send messages and refresh the page, all messages are lost.
They should persist in IndexedDB.

Steps:
1. Open app
2. Select Sherlock character
3. Send "Hello"
4. Refresh page (F5)
5. Messages are gone

Environment:
- Chrome 120.0.6099.109
- Windows 11
- Desktop

Console errors:
None

Expected:
Messages should persist across refreshes.
```

### Where to Get Help

- **GitHub Issues:** https://github.com/your-org/ai-chat-game/issues
- **Discussions:** https://github.com/your-org/ai-chat-game/discussions
- **Discord:** [Invite link]
- **Email:** support@your-domain.com

---

## 📚 Related Documentation

- [Features](FEATURES.md) — Complete feature list
- [Architecture](ARCHITECTURE.md) — System design
- [Deployment](DEPLOYMENT.md) — Setup guides
- [Character Editor](CHARACTER_EDITOR.md) — Creating characters
- [Token Dashboard](TOKEN_DASHBOARD.md) — Usage tracking

---

**Still having issues? Create a GitHub Issue!** 🐛
