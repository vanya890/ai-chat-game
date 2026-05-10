import { useEffect } from 'react'
import { useCharacterStore } from '../stores/characterStore'
import { useNavigate } from 'react-router-dom'
import { Search, Tag } from 'lucide-react'

export function GalleryPage() {
  const { characters, loading, searchQuery, selectedTags, loadCharacters, setSearchQuery, toggleTag, filteredCharacters, getAllTags } = useCharacterStore()
  const navigate = useNavigate()

  useEffect(() => {
    loadCharacters()
  }, [loadCharacters])

  const filtered = filteredCharacters()
  const allTags = getAllTags()

  const handleStartChat = (characterId: string) => {
    navigate(`/chat/new?character=${characterId}`)
  }

  if (loading) {
    return <div className="loading-screen"><div className="loading-spinner"></div><p>Загрузка персонажей...</p></div>
  }

  return (
    <div className="gallery-page">
      <div className="gallery-header">
        <h1>Галерея персонажей</h1>
        <div className="search-bar">
          <Search size={18} />
          <input
            type="text"
            placeholder="Поиск по имени, описанию, тегам..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {allTags.length > 0 && (
        <div className="tags-filter">
          {allTags.map(tag => (
            <button
              key={tag}
              className={`tag-pill ${selectedTags.includes(tag) ? 'active' : ''}`}
              onClick={() => toggleTag(tag)}
            >
              <Tag size={14} />
              {tag}
            </button>
          ))}
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="empty-state">
          <p>Персонажи не найдены</p>
        </div>
      ) : (
        <div className="character-grid">
          {filtered.map(character => (
            <div key={character.id} className="character-card" onClick={() => handleStartChat(character.id)}>
              <div className="character-avatar">
                {character.avatar ? (
                  <img src={character.avatar} alt={character.name} />
                ) : (
                  <div className="avatar-placeholder">{character.name[0]}</div>
                )}
              </div>
              <div className="character-info">
                <h3>{character.name}</h3>
                <p>{character.description}</p>
                <div className="character-tags">
                  {character.tags.map(tag => (
                    <span key={tag} className="tag">#{tag}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
