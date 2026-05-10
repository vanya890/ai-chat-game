import { useState } from 'react'
import { useCharacterStore } from '../stores/characterStore'
import { Plus, Edit2, Trash2, Sparkles, Wand2 } from 'lucide-react'
import type { Character } from '../types'

export function CharactersPage() {
  const { characters, addCharacter, removeCharacter } = useCharacterStore()
  const [showForm, setShowForm] = useState(false)
  const [showAiForm, setShowAiForm] = useState(false)
  const [editingChar, setEditingChar] = useState<Character | null>(null)

  const handleDelete = async (id: string) => {
    if (confirm('Удалить этого персонажа?')) {
      await removeCharacter(id)
    }
  }

  return (
    <div className="characters-page">
      <div className="characters-header">
        <h1>Персонажи</h1>
        <div className="header-actions">
          <button className="btn-secondary" onClick={() => setShowAiForm(true)}>
            <Wand2 size={16} />
            Создать с AI
          </button>
          <button className="btn-primary" onClick={() => setShowForm(true)}>
            <Plus size={16} />
            Создать
          </button>
        </div>
      </div>

      <div className="characters-list">
        {characters.map(char => (
          <div key={char.id} className="character-list-item">
            <div className="char-avatar">
              {char.avatar ? <img src={char.avatar} alt={char.name} /> : <div className="avatar-placeholder">{char.name[0]}</div>}
            </div>
            <div className="char-info">
              <h3>{char.name}</h3>
              <p>{char.description}</p>
              <div className="char-tags">
                {char.tags.map(tag => <span key={tag} className="tag">#{tag}</span>)}
              </div>
            </div>
            <div className="char-actions">
              <button className="icon-btn" onClick={() => setEditingChar(char)}><Edit2 size={16} /></button>
              <button className="icon-btn danger" onClick={() => handleDelete(char.id)}><Trash2 size={16} /></button>
            </div>
          </div>
        ))}
      </div>

      {showForm && <CharacterForm onClose={() => setShowForm(false)} onSave={async (char) => { await addCharacter(char); setShowForm(false) }} />}
      {showAiForm && <AiCharacterForm onClose={() => setShowAiForm(false)} onSave={async (char) => { await addCharacter(char); setShowAiForm(false) }} />}
      {editingChar && <CharacterForm character={editingChar} onClose={() => setEditingChar(null)} onSave={async (char) => { await addCharacter(char); setEditingChar(null) }} />}
    </div>
  )
}

function CharacterForm({ character, onClose, onSave }: { character?: Character; onClose: () => void; onSave: (char: Character) => Promise<void> }) {
  const [name, setName] = useState(character?.name || '')
  const [description, setDescription] = useState(character?.description || '')
  const [personality, setPersonality] = useState(character?.personality || '')
  const [systemPrompt, setSystemPrompt] = useState(character?.systemPrompt || '')
  const [greeting, setGreeting] = useState(character?.greeting || '')
  const [tags, setTags] = useState(character?.tags.join(', ') || '')
  const [model, setModel] = useState(character?.model || 'gpt-4o-mini')
  const [temperature, setTemperature] = useState(character?.temperature ?? 0.7)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const now = new Date().toISOString()
    const char: Character = {
      id: character?.id || crypto.randomUUID(),
      name, description, personality, systemPrompt, greeting,
      avatar: '',
      aiProvider: 'openai',
      model,
      temperature,
      maxTokens: 300,
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      createdAt: character?.createdAt || now,
      updatedAt: now,
      isUserCreated: true
    }
    await onSave(char)
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h2>{character ? 'Редактировать' : 'Новый'} персонаж</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Имя</label>
            <input value={name} onChange={e => setName(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Описание</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Характер</label>
            <textarea value={personality} onChange={e => setPersonality(e.target.value)} placeholder="analytical, observant, dry humor" />
          </div>
          <div className="form-group">
            <label>System Prompt</label>
            <textarea value={systemPrompt} onChange={e => setSystemPrompt(e.target.value)} required rows={4} />
          </div>
          <div className="form-group">
            <label>Приветствие</label>
            <textarea value={greeting} onChange={e => setGreeting(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Теги (через запятую)</label>
            <input value={tags} onChange={e => setTags(e.target.value)} placeholder="detective, mystery" />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Модель</label>
              <select value={model} onChange={e => setModel(e.target.value)}>
                <option value="gpt-4o-mini">GPT-4o Mini</option>
                <option value="gpt-4o">GPT-4o</option>
              </select>
            </div>
            <div className="form-group">
              <label>Температура: {temperature}</label>
              <input type="range" min="0" max="1" step="0.1" value={temperature} onChange={e => setTemperature(parseFloat(e.target.value))} />
            </div>
          </div>
          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>Отмена</button>
            <button type="submit" className="btn-primary">Сохранить</button>
          </div>
        </form>
      </div>
    </div>
  )
}

function AiCharacterForm({ onClose, onSave }: { onClose: () => void; onSave: (char: Character) => Promise<void> }) {
  const [prompt, setPrompt] = useState('')
  const [loading, setLoading] = useState(false)
  const [generated, setGenerated] = useState<Partial<Character> | null>(null)
  const { settings } = { settings: { apiKey: '' } }

  const handleGenerate = async () => {
    if (!prompt.trim()) return
    setLoading(true)
    try {
      // AI generation would go here - for now, create a basic character from prompt
      const now = new Date().toISOString()
      setGenerated({
        name: prompt.split(' ').slice(0, 3).join(' '),
        description: prompt,
        personality: 'unique, interesting',
        systemPrompt: `You are ${prompt}. Stay in character.`,
        greeting: `Привет! Я ${prompt.split(' ')[0]}.`,
        tags: ['custom'],
        model: 'gpt-4o-mini',
        temperature: 0.7
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!generated) return
    const now = new Date().toISOString()
    const char: Character = {
      id: crypto.randomUUID(),
      name: generated.name || 'Персонаж',
      description: generated.description || '',
      personality: generated.personality || '',
      systemPrompt: generated.systemPrompt || '',
      greeting: generated.greeting || '',
      avatar: '',
      aiProvider: 'openai',
      model: generated.model || 'gpt-4o-mini',
      temperature: generated.temperature ?? 0.7,
      maxTokens: 300,
      tags: generated.tags || ['custom'],
      createdAt: now,
      updatedAt: now,
      isUserCreated: true
    }
    await onSave(char)
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h2><Sparkles size={20} /> Создание персонажа с AI</h2>
        <p className="ai-hint">Опишите персонажа своими словами, а AI создаст полный профиль</p>
        <div className="form-group">
          <label>Описание</label>
          <textarea
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            placeholder="Саркастичный кот, который даёт жизненные советы..."
            rows={3}
          />
        </div>
        <button className="btn-primary" onClick={handleGenerate} disabled={loading || !prompt.trim()}>
          {loading ? 'Генерация...' : <><Wand2 size={16} /> Сгенерировать</>}
        </button>

        {generated && (
          <div className="generated-preview">
            <h3>Результат:</h3>
            <div className="preview-card">
              <strong>{generated.name}</strong>
              <p>{generated.description}</p>
              <p><em>{generated.systemPrompt}</em></p>
            </div>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={onClose}>Отмена</button>
              <button className="btn-primary" onClick={handleSave}>Сохранить</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
