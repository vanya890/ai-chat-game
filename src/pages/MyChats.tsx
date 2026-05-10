import { useNavigate } from 'react-router-dom';
import { useChatStore } from '../stores/chatStore';
import { useCharacterStore } from '../stores/characterStore';
import { Trash2 } from 'lucide-react';

export default function MyChats() {
  const navigate = useNavigate();
  const chats = useChatStore(s => s.chats);
  const characters = useCharacterStore(s => s.characters);
  const deleteChat = useChatStore(s => s.deleteChat);

  const getCharacter = (characterId: string) => {
    return characters.find(c => c.id === characterId);
  };

  const formatTime = (iso: string) => {
    const date = new Date(iso);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'только что';
    if (minutes < 60) return `${minutes} мин назад`;
    if (hours < 24) return `${hours} ч назад`;
    if (days < 7) return `${days} дн назад`;
    return date.toLocaleDateString('ru-RU');
  };

  if (chats.length === 0) {
    return (
      <div className="my-chats">
        <h2>Мои чаты</h2>
        <div className="empty-state">
          <p>Пока нет чатов. Начни разговор в галерее!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="my-chats">
      <h2>Мои чаты</h2>
      <div className="chat-list">
        {chats.map(chat => {
          const character = getCharacter(chat.characterId);
          return (
            <div
              key={chat.id}
              className="chat-list-item"
              onClick={() => navigate(`/chat/${chat.id}`)}
            >
              <div className="chat-list-avatar">
                {character?.avatar || '🤖'}
              </div>
              <div className="chat-list-info">
                <h4>{character?.name || 'Неизвестный персонаж'}</h4>
                <p>{chat.lastMessagePreview || 'Нет сообщений'}</p>
              </div>
              <span className="chat-list-time">{formatTime(chat.updatedAt)}</span>
              <button
                className="chat-list-delete"
                onClick={e => {
                  e.stopPropagation();
                  if (confirm('Удалить чат?')) deleteChat(chat.id);
                }}
              >
                <Trash2 width={16} height={16} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
