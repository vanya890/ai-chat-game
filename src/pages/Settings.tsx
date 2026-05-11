import { useState } from 'react';
import { useSettingsStore } from '../stores/settingsStore';
import { Save, Eye, EyeOff, Download, Trash2 } from 'lucide-react';
import { db } from '../db';

export default function Settings() {
  const settings = useSettingsStore(s => s.settings);
  const updateSettings = useSettingsStore(s => s.updateSettings);
  const setTheme = useSettingsStore(s => s.setTheme);

  const [apiKey, setApiKey] = useState(settings.apiKey || '');
  const [showKey, setShowKey] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    await updateSettings({ apiKey });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleExport = async () => {
    const data = {
      characters: await db.characters.toArray(),
      chats: await db.chats.toArray(),
      messages: await db.messages.toArray(),
      settings: await db.settings.toArray()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai-chat-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClearAll = async () => {
    if (confirm('Удалить ВСЕ данные? Это действие нельзя отменить.')) {
      await db.characters.clear();
      await db.chats.clear();
      await db.messages.clear();
      window.location.reload();
    }
  };

  return (
    <div className="settings">
      <h2>Настройки</h2>

      <div className="settings-group">
        <h3>API</h3>
        <div className="setting-row">
          <label>OpenAI API Key</label>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input
              type={showKey ? 'text' : 'password'}
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
              placeholder="sk-..."
            />
            <button className="btn btn-secondary" onClick={() => setShowKey(!showKey)} style={{ padding: '8px' }}>
              {showKey ? <EyeOff width={16} height={16} /> : <Eye width={16} height={16} />}
            </button>
          </div>
        </div>
        <div className="setting-row">
          <label>Модель по умолчанию</label>
          <select
            value={settings.defaultModel || 'gpt-4o-mini'}
            onChange={e => updateSettings({ defaultModel: e.target.value })}
          >
            <option value="gpt-4o-mini">gpt-4o-mini (быстрая)</option>
            <option value="gpt-4o">gpt-4o (качественная)</option>
          </select>
        </div>
        <div className="setting-row">
          <label>Температура</label>
          <input
            type="number"
            min="0"
            max="1"
            step="0.1"
            value={settings.defaultTemperature ?? 0.7}
            onChange={e => updateSettings({ defaultTemperature: parseFloat(e.target.value) })}
          />
        </div>
        <div className="setting-row">
          <label>Макс. история</label>
          <input
            type="number"
            min="5"
            max="50"
            value={settings.maxHistoryLength ?? 20}
            onChange={e => updateSettings({ maxHistoryLength: parseInt(e.target.value) })}
          />
        </div>
        <button className="btn btn-primary" onClick={handleSave} style={{ marginTop: 12 }}>
          <Save width={16} height={16} />
          {saved ? 'Сохранено!' : 'Сохранить'}
        </button>
      </div>

      <div className="settings-group">
        <h3>Тема</h3>
        <div className="setting-row">
          <label>Оформление</label>
          <select
            value={settings.theme || 'dark'}
            onChange={e => setTheme(e.target.value as any)}
          >
            <option value="dark">Тёмная</option>
            <option value="light">Светлая</option>
          </select>
        </div>
      </div>

      <div className="settings-group">
        <h3>Данные</h3>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-secondary" onClick={handleExport}>
            <Download width={16} height={16} /> Экспорт
          </button>
          <button className="btn btn-danger" onClick={handleClearAll}>
            <Trash2 width={16} height={16} /> Удалить всё
          </button>
        </div>
      </div>

      <div className="settings-group">
        <h3>О приложении</h3>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          AI Chat Game — платформа для общения с ИИ-персонажами.
          Все данные хранятся локально в браузере (IndexedDB).
          API ключ также хранится локально и никуда не отправляется.
        </p>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>
          Стек: React + TypeScript + Vite + Zustand + Dexie + OpenAI API
        </p>
      </div>
    </div>
  );
}
