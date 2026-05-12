import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCharacterStore } from '../stores/characterStore';
import { useChatStore } from '../stores/chatStore';
import { Search, X } from 'lucide-react';

export default function Gallery() {
  const navigate = useNavigate();
  const characters = useCharacterStore(s => s.characters);
  const searchCharacters = useCharacterStore(s => s.searchCharacters);
  const createChat = useChatStore(s => s.createChat);

  const [search, setSearch] = useState('');
  const [activeTags, setActiveTags] = useState<string[]>([]);

  const filtered = activeTags.length > 0
    ? searchCharacters(search).filter(c => activeTags.some(t => c.tags.includes(t)))
    : searchCharacters(search);

  const allTags = Array.from(new Set(characters.flatMap(c => c.tags)));

  const toggleTag = (tag: string) => {
    setActiveTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  };

  const handleStartChat = async (characterId: string) => {
    const chat = await createChat(characterId);
    navigate(`/chat/${chat.id}`);
  };

  return (
    <div className="gallery-page">
      <h2>Галерея персонажей</h2>

      <div className="search-bar">
        <Search width={18} height={18} />
        <input
          type="text"
          placeholder="Поиск персонажа..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        {search && <X width={16} height={16} onClick={() => setSearch('')} />}
      </div>

      {allTags.length > 0 && (
        <div className="tag-pills">
          {allTags.map(tag => (
            <button
              key={tag}
              className={`tag-pill ${activeTags.includes(tag) ? 'active' : ''}`}
              onClick={() => toggleTag(tag)}
            >
              {tag}
            </button>
          ))}
        </div>
      )}

      <div className="character-grid">
        {filtered.map(char => (
          <div key={char.id} className="character-card" onClick={() => handleStartChat(char.id)}>
            <div className="card-avatar">
              {renderAvatar(char)}
            </div>
            <div className="card-info">
              <h3>{char.name}</h3>
              <p>{char.description}</p>
              <div className="card-tags">
                {char.tags.slice(0, 3).map(t => <span key={t} className="tag">{t}</span>)}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="empty-state">
          <p>Персонажи не найдены</p>
        </div>
      )}
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
