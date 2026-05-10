import { useState, useEffect } from 'react'
import { useAppStore } from '../stores/appStore'
import { Save, Eye, EyeOff, Moon, Sun } from 'lucide-react'

export function SettingsPage() {
  const { settings, updateSettings, theme, setTheme } = useAppStore()
  const [apiKey, setApiKey] = useState(settings.apiKey || '')
  const [showKey, setShowKey] = useState(false)
  const [defaultModel, setDefaultModel] = useState(settings.defaultModel || 'gpt-4o-mini')
  const [saved, setSaved] = useState(false)

  const handleSave = async () => {
    await updateSettings({ apiKey, defaultModel })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleClearChats = async () => {
    if (confirm('Удалить все чаты? Это действие нельзя отменить.')) {
      const { db } = await import('../db')
      await db.chats.clear()
      await db.messages.clear()
      alert('Все чаты удалены')
    }
  }

  const handleExportData = async () => {
    const { db } = await import('../db')
    const data = {
      characters: await db.characters.toArray(),
      chats: await db.chats.toArray(),
      settings: await db.settings.toArray()
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'ai-chat-game-export.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="settings-page">
      <h1>Настройки</h1>

      <section className="settings-section">
        <h2>API</h2>
        <div className="form-group">
          <label>OpenAI API Key</label>
          <div className="input-with-icon">
            <input
              type={showKey ? 'text' : 'password'}
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
              placeholder="sk-..."
            />
            <button className="icon-btn" onClick={() => setShowKey(!showKey)}>
              {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <p className="hint">Ключ хранится локально в вашем браузере</p>
        </div>

        <div className="form-group">
          <label>Модель по умолчанию</label>
          <select value={defaultModel} onChange={e => setDefaultModel(e.target.value)}>
            <option value="gpt-4o-mini">GPT-4o Mini (быстрая, дешёвая)</option>
            <option value="gpt-4o">GPT-4o (качественная)</option>
          </select>
        </div>

        <button className="btn-primary" onClick={handleSave}>
          <Save size={16} />
          {saved ? 'Сохранено!' : 'Сохранить'}
        </button>
      </section>

      <section className="settings-section">
        <h2>Внешний вид</h2>
        <div className="theme-selector">
          <button className={`theme-btn ${theme === 'light' ? 'active' : ''}`} onClick={() => setTheme('light')}>
            <Sun size={20} />
            Светлая
          </button>
          <button className={`theme-btn ${theme === 'dark' ? 'active' : ''}`} onClick={() => setTheme('dark')}>
            <Moon size={20} />
            Тёмная
          </button>
        </div>
      </section>

      <section className="settings-section danger-zone">
        <h2>Данные</h2>
        <div className="danger-actions">
          <button className="btn-secondary" onClick={handleExportData}>Экспорт данных</button>
          <button className="btn-danger" onClick={handleClearChats}>Удалить все чаты</button>
        </div>
      </section>
    </div>
  )
}
