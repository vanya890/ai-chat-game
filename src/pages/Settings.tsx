import { useState } from 'react';
import { useSettingsStore } from '../stores/settingsStore';
import { useTokenStore } from '../stores/tokenStore';
import { Eye, EyeOff, Download, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import type { AppSettings } from '../types';

export default function Settings() {
  const settings = useSettingsStore(s => s.settings);
  const updateSettings = useSettingsStore(s => s.updateSettings);
  const setTheme = useSettingsStore(s => s.setTheme);
  const loadUsages = useTokenStore(s => s.loadUsages);
  const getTotalTokens = useTokenStore(s => s.getTotalTokens);
  const getCostEstimate = useTokenStore(s => s.getCostEstimate);

  const [showApiKey, setShowApiKey] = useState(false);
  const [showDalleKey, setShowDalleKey] = useState(false);
  const [showCustomKey, setShowCustomKey] = useState(false);
  const [openSection, setOpenSection] = useState<string>('chat');

  const toggleSection = (section: string) => {
    setOpenSection(openSection === section ? '' : section);
  };

  const handleExport = async () => {
    const data = {
      settings,
      characters: await (await import('../stores/characterStore')).useCharacterStore.getState().characters,
      chats: await (await import('../stores/chatStore')).useChatStore.getState().chats,
      messages: await (await import('../stores/chatStore')).useChatStore.getState().messages,
      tokenUsage: await (await import('../db')).db.tokenUsage.toArray()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai-chat-game-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDeleteAll = async () => {
    if (!confirm('Удалить ВСЕ данные? Это действие нельзя отменить.')) return;
    const { db } = await import('../db');
    await db.characters.clear();
    await db.chats.clear();
    await db.messages.clear();
    await db.settings.clear();
    await db.cache.clear();
    await db.tokenUsage.clear();
    window.location.reload();
  };

  const update = (key: keyof AppSettings, value: any) => {
    updateSettings({ [key]: value });
  };

  return (
    <div className="settings-page">
      <h2>Настройки</h2>

      {/* Stats */}
      <div className="stats-row" onClick={() => loadUsages()}>
        <div className="stat-card">
          <span className="stat-value">{getTotalTokens().toLocaleString()}</span>
          <span className="stat-label">Всего токенов</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">${getCostEstimate().toFixed(4)}</span>
          <span className="stat-label">Оценка стоимости</span>
        </div>
      </div>

      {/* Chat AI Section */}
      <Section title="💬 Чат AI" section="chat" open={openSection} onToggle={toggleSection}>
        <div className="setting-group">
          <label>OpenAI API Key</label>
          <div className="input-with-icon">
            <input
              type={showApiKey ? 'text' : 'password'}
              value={settings.apiKey}
              onChange={e => update('apiKey', e.target.value)}
              placeholder="sk-..."
            />
            <button onClick={() => setShowApiKey(!showApiKey)}>
              {showApiKey ? <EyeOff width={18} /> : <Eye width={18} />}
            </button>
          </div>
        </div>

        <div className="setting-group">
          <label>Модель по умолчанию</label>
          <select value={settings.defaultModel} onChange={e => update('defaultModel', e.target.value)}>
            <option value="gpt-4o-mini">gpt-4o-mini (быстро, дёшево)</option>
            <option value="gpt-4o">gpt-4o (качественно)</option>
            <option value="gpt-4o-mini">gpt-3.5-turbo</option>
          </select>
        </div>

        <div className="setting-group">
          <label>Температура: {settings.defaultTemperature}</label>
          <input
            type="range" min="0" max="1" step="0.1"
            value={settings.defaultTemperature}
            onChange={e => update('defaultTemperature', parseFloat(e.target.value))}
          />
        </div>

        <div className="setting-group">
          <label>Макс. история: {settings.maxHistoryLength} сообщений</label>
          <input
            type="range" min="5" max="50" step="5"
            value={settings.maxHistoryLength}
            onChange={e => update('maxHistoryLength', parseInt(e.target.value))}
          />
        </div>
      </Section>

      {/* Custom / Local Provider */}
      <Section title="🔧 Кастомный / Локальный API" section="custom" open={openSection} onToggle={toggleSection}>
        <p className="section-desc">Для локальных моделей (Ollama, LM Studio, vLLM) или OpenAI-compatible серверов</p>
        <div className="setting-group">
          <label>API URL</label>
          <input
            value={settings.customApiUrl}
            onChange={e => update('customApiUrl', e.target.value)}
            placeholder="http://localhost:11434/v1"
          />
        </div>
        <div className="setting-group">
          <label>API Key (если требуется)</label>
          <div className="input-with-icon">
            <input
              type={showCustomKey ? 'text' : 'password'}
              value={settings.customApiKey}
              onChange={e => update('customApiKey', e.target.value)}
              placeholder="key или пусто"
            />
            <button onClick={() => setShowCustomKey(!showCustomKey)}>
              {showCustomKey ? <EyeOff width={18} /> : <Eye width={18} />}
            </button>
          </div>
        </div>
        <div className="setting-group">
          <label>Модель</label>
          <input
            value={settings.customModel}
            onChange={e => update('customModel', e.target.value)}
            placeholder="llama3, mistral, ..."
          />
        </div>
      </Section>

      {/* Image Generation */}
      <Section title="🎨 Генерация изображений" section="image" open={openSection} onToggle={toggleSection}>
        <div className="setting-group">
          <label>Провайдер</label>
          <select value={settings.imageProvider} onChange={e => update('imageProvider', e.target.value)}>
            <option value="none">Отключено</option>
            <option value="dalle">DALL-E 3 (OpenAI)</option>
            <option value="comfyui">ComfyUI (локальный)</option>
          </select>
        </div>

        {settings.imageProvider === 'dalle' && (
          <div className="setting-group">
            <label>DALL-E API Key</label>
            <div className="input-with-icon">
              <input
                type={showDalleKey ? 'text' : 'password'}
                value={settings.dalleApiKey}
                onChange={e => update('dalleApiKey', e.target.value)}
                placeholder="sk-..."
              />
              <button onClick={() => setShowDalleKey(!showDalleKey)}>
                {showDalleKey ? <EyeOff width={18} /> : <Eye width={18} />}
              </button>
            </div>
          </div>
        )}

        {settings.imageProvider === 'comfyui' && (
          <>
            <div className="setting-group">
              <label>ComfyUI URL</label>
              <input
                value={settings.comfyUiUrl}
                onChange={e => update('comfyUiUrl', e.target.value)}
                placeholder="http://127.0.0.1:8188"
              />
            </div>
            <div className="setting-group">
              <label>Модель (checkpoint)</label>
              <input
                value={settings.comfyUiModel}
                onChange={e => update('comfyUiModel', e.target.value)}
                placeholder="v1-5-pruned-emaonly.safetensors"
              />
            </div>
            <div className="setting-group">
              <label>Позитивный промпт (префикс)</label>
              <input
                value={settings.comfyUiPositivePrompt}
                onChange={e => update('comfyUiPositivePrompt', e.target.value)}
                placeholder="high quality, detailed"
              />
            </div>
            <div className="setting-group">
              <label>Негативный промпт</label>
              <input
                value={settings.comfyUiNegativePrompt}
                onChange={e => update('comfyUiNegativePrompt', e.target.value)}
                placeholder="low quality, blurry"
              />
            </div>
            <div className="setting-row">
              <div className="setting-group half">
                <label>Ширина: {settings.imageWidth}</label>
                <input
                  type="range" min="256" max="1024" step="64"
                  value={settings.imageWidth}
                  onChange={e => update('imageWidth', parseInt(e.target.value))}
                />
              </div>
              <div className="setting-group half">
                <label>Высота: {settings.imageHeight}</label>
                <input
                  type="range" min="256" max="1024" step="64"
                  value={settings.imageHeight}
                  onChange={e => update('imageHeight', parseInt(e.target.value))}
                />
              </div>
            </div>
            <div className="setting-group">
              <label>Шаги: {settings.imageSteps}</label>
              <input
                type="range" min="10" max="50" step="5"
                value={settings.imageSteps}
                onChange={e => update('imageSteps', parseInt(e.target.value))}
              />
            </div>
          </>
        )}
      </Section>

      {/* Appearance */}
      <Section title="🎯 Внешний вид" section="appearance" open={openSection} onToggle={toggleSection}>
        <div className="setting-group">
          <label>Тема</label>
          <select value={settings.theme} onChange={e => setTheme(e.target.value as 'dark' | 'light')}>
            <option value="dark">Тёмная</option>
            <option value="light">Светлая</option>
          </select>
        </div>
      </Section>

      {/* Data */}
      <Section title="💾 Данные" section="data" open={openSection} onToggle={toggleSection}>
        <div className="data-actions">
          <button className="btn-export" onClick={handleExport}>
            <Download width={18} /> Экспорт JSON
          </button>
          <button className="btn-delete" onClick={handleDeleteAll}>
            <Trash2 width={18} /> Удалить всё
          </button>
        </div>
      </Section>
    </div>
  );
}

function Section({ title, section, open, onToggle, children }: {
  title: string; section: string; open: string;
  onToggle: (s: string) => void; children: React.ReactNode;
}) {
  const isOpen = open === section;
  return (
    <div className="settings-section">
      <button className="section-header" onClick={() => onToggle(section)}>
        <span>{title}</span>
        {isOpen ? <ChevronUp width={18} /> : <ChevronDown width={18} />}
      </button>
      {isOpen && <div className="section-content">{children}</div>}
    </div>
  );
}
