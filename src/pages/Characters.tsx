import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCharacterStore } from '../stores/characterStore';
import { useSettingsStore } from '../stores/settingsStore';
import { useAIStore } from '../stores/aiStore';
import type { Character } from '../types';
import { Plus, Sparkles, Trash2, Edit2 } from 'lucide-react';

export default function Characters() {
  const navigate = useNavigate();
  const characters = useCharacterStore(s => s.characters);
  const addCharacter = useCharacterStore(s => s.addCharacter);
  const updateCharacter = useCharacterStore(s => s.updateCharacter);
  const deleteCharacter = useCharacterStore(s => s.deleteCharacter);
  const apiKey = useSettingsStore(s => s.settings.apiKey);
  const generateCharacter = useAIStore(s => s.generateCharacter);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [formData, setFormData] = useState<Partial<Character>>({
    name: '',
    description: '',
    personality: '',
    systemPrompt: '',
    greeting: '',
    tags: [],
    temperature: 0.7,
    maxTokens: 300,
    model: 'gpt-4o-mini',
    avatar: '🤖'
  });

  const [tagsInput, setTagsInput] = useState('');

  const resetForm = () => {
    setFormData({
      name: '', description: '', personality: '', systemPrompt: '',
      greeting: '', tags: [], temperature: 0.7, maxTokens: 300,
      model: 'gpt-4o-mini', avatar: '🤖'
    });
    setTagsInput('');
    setShowForm(false);
    setEditingId(null);
  };

  const startEdit = (char: Character) => {
    setFormData(char);
    setTagsInput(char.tags.join(', '));
    setEditingId(char.id);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.systemPrompt) return;

    const tags = tagsInput.split(',').map(t => t.trim()).filter(Boolean);
    const character: Character = {
      id: editingId || crypto.randomUUID(),
      name: formData.name || '',
      avatar: formData.avatar || '🤖',
      description: formData.description || '',
      personality: formData.personality || '',
      systemPrompt: formData.systemPrompt || '',
      greeting: formData.greeting || 'Привет!',
      aiProvider: 'openai',
      model: formData.model || 'gpt-4o-mini',
      temperature: formData.temperature ?? 0.7,
      maxTokens: formData.maxTokens ?? 300,
      tags,
      isUserCreated: true,
      createdAt: editingId ? characters.find(c => c.id === editingId)?.createdAt || new Date().toISOString() : new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (editingId) {
      await updateCharacter(editingId, character);
    } else {
      await addCharacter(character);
    }
    resetForm();
  };

  const handleAIGenerate = async () => {
    if (!aiPrompt || !apiKey) return;
    setIsGenerating(true);
    try {
      // Use OpenAI directly
      const response = await fetch(`${import.meta.env.VITE_OPENAI_BASE_URL || 'https://api.openai.com/v1'}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: `Create a character. Return JSON with: name, description, personality, systemPrompt (concise, 80-120 tokens), greeting, tags (array), temperature (0.3-0.9), maxTokens (200-500). Respond in Russian.`
            },
            { role: 'user', content: aiPrompt }
          ],
          max_tokens: 600,
          temperature: 0.8,
          response_format: { type: 'json_object' }
        })
      });
      const data = await response.json();
      const parsed = JSON.parse(data.choices[0].message.content);
      
      setFormData({
        name: parsed.name,
        description: parsed.description,
        personality: parsed.personality,
        systemPrompt: parsed.systemPrompt,
        greeting: parsed.greeting,
        tags: parsed.tags || [],
        temperature: parsed.temperature ?? 0.7,
        maxTokens: parsed.maxTokens ?? 300,
        model: 'gpt-4o-mini',
        avatar: '🤖'
      });
      setTagsInput((parsed.tags || []).join(', '));
      setShowForm(true);
    } catch (error) {
      console.error('AI generation failed:', error);
    } finally {
      setIsGenerating(false);
      setAiPrompt('');
    }
  };

  return (
    <div className="character-editor">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2>Персонажи</h2>
        <button className="btn btn-primary" onClick={() => { resetForm(); setShowForm(true); }}>
          <Plus width={16} height={16} /> Создать
        </button>
      </div>

      {/* AI Generation */}
      <div className="settings-group" style={{ marginBottom: 16 }}>
        <h3>✨ Создать с помощью ИИ</h3>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            className="search-bar"
            placeholder="Опиши персонажа: 'Саркастичный кот, который даёт жизненные советы'"
            value={aiPrompt}
            onChange={e => setAiPrompt(e.target.value)}
            style={{ flex: 1 }}
          />
          <button
            className="btn btn-ai"
            disabled={!aiPrompt || !apiKey || isGenerating}
            onClick={handleAIGenerate}
          >
            <Sparkles width={16} height={16} />
            {isGenerating ? '...' : 'Создать'}
          </button>
        </div>
      </div>

      {/* Character Form */}
      {showForm && (
        <div className="settings-group editor-form">
          <h3>{editingId ? 'Редактировать' : 'Новый персонаж'}</h3>
          <div className="form-group">
            <label>Имя *</label>
            <input value={formData.name || ''} onChange={e => setFormData({ ...formData, name: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Аватар (эмодзи)</label>
            <input value={formData.avatar || ''} onChange={e => setFormData({ ...formData, avatar: e.target.value })} placeholder="🤖" />
          </div>
          <div className="form-group">
            <label>Описание</label>
            <input value={formData.description || ''} onChange={e => setFormData({ ...formData, description: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Характер (traits)</label>
            <input value={formData.personality || ''} onChange={e => setFormData({ ...formData, personality: e.target.value })} placeholder="analytical, observant, dry humor" />
          </div>
          <div className="form-group">
            <label>System Prompt *</label>
            <textarea value={formData.systemPrompt || ''} onChange={e => setFormData({ ...formData, systemPrompt: e.target.value })} placeholder="You are... Keep responses concise." />
          </div>
          <div className="form-group">
            <label>Приветствие</label>
            <textarea value={formData.greeting || ''} onChange={e => setFormData({ ...formData, greeting: e.target.value })} placeholder="Привет!" style={{ minHeight: 60 }} />
          </div>
          <div className="form-group">
            <label>Теги (через запятую)</label>
            <input value={tagsInput} onChange={e => setTagsInput(e.target.value)} placeholder="detective, mystery, logic" />
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label>Модель</label>
              <select value={formData.model || 'gpt-4o-mini'} onChange={e => setFormData({ ...formData, model: e.target.value })}>
                <option value="gpt-4o-mini">gpt-4o-mini</option>
                <option value="gpt-4o">gpt-4o</option>
              </select>
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label>Температура</label>
              <input type="number" min="0" max="1" step="0.1" value={formData.temperature ?? 0.7} onChange={e => setFormData({ ...formData, temperature: parseFloat(e.target.value) })} />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label>Max токенов</label>
              <input type="number" min="50" max="2000" step="50" value={formData.maxTokens ?? 300} onChange={e => setFormData({ ...formData, maxTokens: parseInt(e.target.value) })} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-primary" onClick={handleSave}>Сохранить</button>
            <button className="btn btn-secondary" onClick={resetForm}>Отмена</button>
          </div>
        </div>
      )}

      {/* Character List */}
      <div className="chat-list">
        {characters.map(char => (
          <div key={char.id} className="chat-list-item">
            <div className="chat-list-avatar">{char.avatar}</div>
            <div className="chat-list-info">
              <h4>{char.name} {char.isUserCreated && <span style={{ fontSize: 11, color: 'var(--accent)' }}>(свой)</span>}</h4>
              <p>{char.description}</p>
            </div>
            {char.isUserCreated && (
              <>
                <button className="chat-list-delete" style={{ opacity: 1 }} onClick={() => startEdit(char)}>
                  <Edit2 width={16} height={16} />
                </button>
                <button className="chat-list-delete" style={{ opacity: 1 }} onClick={() => { if (confirm('Удалить персонажа?')) deleteCharacter(char.id); }}>
                  <Trash2 width={16} height={16} />
                </button>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
