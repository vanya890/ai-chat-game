import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useChatStore } from '../stores/chatStore';
import { useCharacterStore } from '../stores/characterStore';
import { Trash2, Pin } from 'lucide-react';

export default function MyChats() {
  const navigate = useNavigate();
  const chats = useChatStore(s => s.chats);
  const loadChats = useChatStore(s => s.loadChats);
  const deleteChat = useChatStore(s => s.deleteChat);
  const pinChat = useChatStore(s => s.pinChat);
  const characters = useCharacterStore(s => s.characters);

  useEffect(() => {
    loadChats();
  }, []);

  const sorted = [...chats].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });

  const getChar = (charId: string) => characters.find(c => c.id === charId);

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    if (diff < 60000) return 'только что';
    if (diff < 3600000) return `${Math.floor(diff / 60000)} мин назад`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} ч назад`;
    return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
  };

  return (
    <div className="my-chats-page">
      <h2>Мои чаты</h2>

      {sorted.length === 0 ? (
        <div className="empty-state">
          <p>У вас пока нет чатов</p>
          <button onClick={() => navigate('/gallery')}>Начать чат</button>
        </div>
      ) : (
        <div className="chat-list">
          {sorted.map(chat => {
            const char = getChar(chat.characterId);
            return (
              <div
                key={chat.id}
                className="chat-list-item"
                onClick={() => navigate(`/chat/${chat.id}`)}
              >
                <div className="chat-avatar">
                  {char ? renderAvatar(char) : '🤖'}
                </div>
                <div className="chat-info">
                  <div className="chat-info-top">
                    <h4>{char?.name || 'Чат'}</h4>
                    <span className="chat-time">{formatTime(chat.updatedAt)}</span>
                  </div>
                  <p className="chat-preview">{chat.lastMessagePreview || 'Нет сообщений'}</p>
                </div>
                <div className="chat-actions">
                  <button onClick={e => { e.stopPropagation(); pinChat(chat.id); }}>
                    <Pin width={16} className={chat.isPinned ? 'pinned' : ''} />
                  </button>
                  <button onClick={e => { e.stopPropagation(); deleteChat(chat.id); }}>
                    <Trash2 width={16} />
                  </button>
                </div>
              </div>
            );
          })}
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
