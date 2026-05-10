import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getChats, deleteChat, getCharacter } from '../db'
import type { Chat, Character } from '../types'
import { Trash2, MessageSquare } from 'lucide-react'

export function ChatsPage() {
  const [chats, setChats] = React.useState<Chat[]>([])
  const [characters, setCharacters] = React.useState<Record<string, Character>>({})
  const navigate = useNavigate()

  useEffect(() => {
    loadChats()
  }, [])

  const loadChats = async () => {
    const chatsList = await getChats()
    setChats(chatsList)

    // Load character info for each chat
    const charMap: Record<string, Character> = {}
    for (const chat of chatsList) {
      if (!charMap[chat.characterId]) {
        const char = await getCharacter(chat.characterId)
        if (char) charMap[chat.characterId] = char
      }
    }
    setCharacters(charMap)
  }

  const handleDeleteChat = async (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (confirm('Удалить этот чат?')) {
      await deleteChat(chatId)
      loadChats()
    }
  }

  const handleOpenChat = (chatId: string) => {
    navigate(`/chat/${chatId}`)
  }

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'только что'
    if (minutes < 60) return `${minutes} мин назад`
    if (hours < 24) return `${hours} ч назад`
    if (days < 7) return `${days} дн назад`
    return date.toLocaleDateString('ru-RU')
  }

  return (
    <div className="chats-page">
      <div className="chats-header">
        <h1>Мои чаты</h1>
        <span className="chat-count">{chats.length} {chats.length === 1 ? 'чат' : chats.length < 5 ? 'чата' : 'чатов'}</span>
      </div>

      {chats.length === 0 ? (
        <div className="empty-state">
          <MessageSquare size={48} />
          <h2>Пока нет чатов</h2>
          <p>Начните разговор с персонажем из галереи</p>
          <button className="btn-primary" onClick={() => navigate('/gallery')}>
            Перейти в галерею
          </button>
        </div>
      ) : (
        <div className="chats-list">
          {chats.map(chat => {
            const character = characters[chat.characterId]
            return (
              <div key={chat.id} className="chat-item" onClick={() => handleOpenChat(chat.id)}>
                <div className="chat-avatar">
                  {character?.avatar ? (
                    <img src={character.avatar} alt={character.name} />
                  ) : (
                    <div className="avatar-placeholder">{character?.name?.[0] || '?'}</div>
                  )}
                </div>
                <div className="chat-info">
                  <div className="chat-top">
                    <h3>{chat.title || character?.name || 'Чат'}</h3>
                    <span className="chat-time">{formatTime(chat.updatedAt)}</span>
                  </div>
                  <p className="chat-preview">{chat.lastMessagePreview || 'Начните разговор...'}</p>
                </div>
                <button className="chat-delete" onClick={(e) => handleDeleteChat(chat.id, e)}>
                  <Trash2 size={16} />
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
