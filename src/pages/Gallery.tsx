import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCharacterStore } from '../stores/characterStore';
import { useChatStore } from '../stores/chatStore';
import { Search } from 'lucide-react';

export default function Gallery() {
  const navigate = useNavigate();
  const characters = useCharacterStore(s => s.characters);
  const searchCharacters = useCharacterStore(s => s.searchCharacters);
  const filterByTags = useCharacterStore(s => s.filterByTags);
  const createChat = useChatStore(s => s.createChat);
  
  const [search, setSearch] = useState('');
  const [activeTags, setActiveTags] = useState<string[]>([]);

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    characters.forEach(c => c.tags.forEach(t => tags.add(t)));
    return Array.from(tags).sort();
  }, [characters]);

  const filtered = useMemo(() => {
    let result = characters;
    if (search) result = searchCharacters(search);
    if (activeTags.length > 0) result = filterByTags(activeTags);
    return result;
  }, [characters, search, activeTags, searchCharacters, filterByTags]);

  const toggleTag = (tag: string) => {
    setActiveTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const startChat = async (characterId: string) => {
    const chat = await createChat(characterId);
    navigate(`/chat/${chat.id}`);
  };

  return (
    <div className="gallery">
      <div className="gallery-header">
        <h2>Выбери персонажа</h2>
        <div style={{ position: 'relative' }}>
          <Search style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: 'var(--text-secondary)' }} />
          <input
            className="search-bar"
            style={{ paddingLeft: 36 }}
            placeholder="Поиск по имени, описанию, тегам..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        {allTags.length > 0 && (
          <div className="tag-filters">
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
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <Search />
          <p>Ничего не найдено</p>
        </div>
      ) : (
        <div className="character-grid">
          {filtered.map(char => (
            <div
              key={char.id}
              className="character-card"
              onClick={() => startChat(char.id)}
            >
              <div className="character-avatar">{char.avatar}</div>
              <h3>{char.name}</h3>
              <p>{char.description}</p>
              <div className="character-tags">
                {char.tags.slice(0, 3).map(tag => (
                  <span key={tag} className="character-tag">{tag}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
