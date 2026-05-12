import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCharacterStore } from '../stores/characterStore';
import { useAIStore } from '../stores/aiStore';
import { Plus, Edit2, Trash2, Wand2, Image } from 'lucide-react';
import { ImageProvider } from '../services/imageProvider';
import { useSettingsStore } from '../stores/settingsStore';
import type { Character } from '../types';

export default function Characters() {
  const navigate = useNavigate();
  const characters = useCharacterStore(s => s.characters);
  const addCharacter = useCharacterStore(s => s.addCharacter);
  const updateCharacter = useCharacterStore(s => s.updateCharacter);
  const deleteCharacter = useCharacterStore(s => s.deleteCharacter);
  const generateCharacter = useAIStore(s => s.generateCharacter);
  const settings = useSettingsStore(s => s.settings);

  const [editing, setEditing] = useState<Character | null>(null);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingAvatar, setIsGeneratingAvatar] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const emptyChar: Character = {
    id: '',
    name: '',
    avatar: '🤖',
    avatarType: 'emoji',
    description: '',
    personality: '',
    systemPrompt: '',
    greeting: '',
    aiProvider: 'openai',
    customApiUrl: '',
    model: settings.defaultModel || 'gpt-4o-mini',
    temperature: settings.defaultTemperature || 0.7,
    maxTokens: 300,
    tags: [],
    isUserCreated: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const [form, setForm] = useState<Character>(emptyChar);

  const handleGenerate = async () => {
    if (!aiPrompt.trim()) return;
    setIsGenerating(true);
    try {
      const generated = await generateCharacter(aiPrompt);
      setForm({
        ...emptyChar,
        ...generated,
        id: crypto.randomUUID(),
        isUserCreated: true
      });
      setShowForm(true);
    } catch (e: any) {
      alert(e.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateAvatar = async () => {
    if (!form.name) return;
    setIsGeneratingAvatar(true);
    try {
      const imgProvider = new ImageProvider(settings);
      const result = await imgProvider.generateAvatar(form.description || form.name);
      setForm({ ...form, avatar: result.imageUrl, avatarType: 'generated' });
    } catch (e: any) {
      alert(e.message);
    } finally {
      setIsGeneratingAvatar(false);
    }
  };

  const handleSave = async () => {
    if (!form.name || !form.systemPrompt) {
      alert('Имя и системный промпт обязательны');
      return;
    }
    const now = new Date().toISOString();
    const char = { ...form, updatedAt: now, createdAt: form.id ? form.createdAt : now };
    if (editing) {
      await updateCharacter(form.id, char);
    } else {
      char.id = crypto.randomUUID();
      await addCharacter(char);
    }
    setEditing(null);
    setShowForm(false);
    setForm(emptyChar);
  };

  const handleEdit = (char: Character) => {
    setEditing(char);
    setForm(char);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Удалить персонажа?')) return;
    await deleteCharacter(id);
  };

  return (
    <div className="characters-page">
      <div className="page-header">
        <h2>Персонажи</h2>
        <button className="btn-create" onClick={() => { setEditing(null); setForm(emptyChar); setShowForm(true); }}>
          <Plus width={18} /> Создать
        </button>
      </div>

      {/* AI Generation */}
      <div className="ai-generate-section">
        <Wand2 width={20} />
        <input
          value={aiPrompt}
          onChange={e => setAiPrompt(e.target.value)}
          placeholder="Опишите персонажа: 'Саркастичный кот, даёт советы'"
          onKeyDown={e => e.key === 'Enter' && handleGenerate()}
        />
        <button onClick={handleGenerate} disabled={isGenerating}>
          {isGenerating ? 'Генерация...' : 'Создать с AI'}
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="character-form">
          <h3>{editing ? 'Редактировать' : 'Новый персонаж'}</h3>

          <div className="form-row">
            <div className="form-group">
              <label>Имя *</label>
              <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
            </div>
            <div className="form-group avatar-group">
              <label>Аватар</label>
              <div className="avatar-preview">
                {form.avatarType === 'url' || form.avatarType === 'generated'
                  ? <img src={form.avatar} alt="" className="avatar-image" />
                  : <span className="avatar-emoji">{form.avatar}</span>}
              </div>
              <input
                value={form.avatar}
                onChange={e => setForm({...form, avatar: e.target.value, avatarType: e.target.value.startsWith('http') ? 'url' : 'emoji'})}
                placeholder="Emoji или URL"
              />
              <button onClick={handleGenerateAvatar} disabled={isGeneratingAvatar} className="btn-avatar-gen">
                <Image width={14} /> {isGeneratingAvatar ? '...' : 'AI аватар'}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label>Описание</label>
            <input value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
          </div>

          <div className="form-group">
            <label>Приветствие</label>
            <textarea value={form.greeting} onChange={e => setForm({...form, greeting: e.target.value})} rows={2} />
          </div>

          <div className="form-group">
            <label>Системный промпт *</label>
            <textarea value={form.systemPrompt} onChange={e => setForm({...form, systemPrompt: e.target.value})} rows={4} />
          </div>

          <div className="form-group">
            <label>Личность (через запятую)</label>
            <input value={form.personality} onChange={e => setForm({...form, personality: e.target.value})} />
          </div>

          <div className="form-group">
            <label>Теги (через запятую)</label>
            <input value={form.tags.join(', ')} onChange={e => setForm({...form, tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean)})} />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Провайдер</label>
              <select value={form.aiProvider} onChange={e => setForm({...form, aiProvider: e.target.value as any})}>
                <option value="openai">OpenAI</option>
                <option value="openai-compatible">OpenAI Compatible</option>
                <option value="local">Локальная модель</option>
              </select>
            </div>
            <div className="form-group">
              <label>Модель</label>
              <input value={form.model} onChange={e => setForm({...form, model: e.target.value})} />
            </div>
          </div>

          {(form.aiProvider === 'openai-compatible' || form.aiProvider === 'local') && (
            <div className="form-group">
              <label>Custom API URL</label>
              <input value={form.customApiUrl} onChange={e => setForm({...form, customApiUrl: e.target.value})} placeholder="http://localhost:11434/v1" />
            </div>
          )}

          <div className="form-row">
            <div className="form-group">
              <label>Температура: {form.temperature}</label>
              <input type="range" min="0" max="1" step="0.1" value={form.temperature} onChange={e => setForm({...form, temperature: parseFloat(e.target.value)})} />
            </div>
            <div className="form-group">
              <label>Макс токенов: {form.maxTokens}</label>
              <input type="range" min="100" max="1000" step="50" value={form.maxTokens} onChange={e => setForm({...form, maxTokens: parseInt(e.target.value)})} />
            </div>
          </div>

          <div className="form-actions">
            <button className="btn-save" onClick={handleSave}>Сохранить</button>
            <button className="btn-cancel" onClick={() => { setShowForm(false); setEditing(null); }}>Отмена</button>
          </div>
        </div>
      )}

      {/* Character List */}
      <div className="character-list">
        {characters.map(char => (
          <div key={char.id} className="character-list-item">
            <div className="item-avatar">
              {renderAvatar(char)}
            </div>
            <div className="item-info">
              <h4>{char.name}</h4>
              <p>{char.description}</p>
            </div>
            {char.isUserCreated && (
              <div className="item-actions">
                <button onClick={() => handleEdit(char)}><Edit2 width={16} /></button>
                <button onClick={() => handleDelete(char.id)}><Trash2 width={16} /></button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function renderAvatar(character: { avatar?: string; avatarType?: string; name?: string }) {
  if (!character?.avatar) return '🤖';
  if (character.avatarType === 'url' || character.avatarType === 'generated') {
    return <img src={character.avatar} alt={character.name} className="avatar-image" />;
  }
  return <span className="avatar-emoji">{character.avatar}</span>;
}
