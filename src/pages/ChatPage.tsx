import { useEffect, useRef, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'
import { useChatStore } from '../stores/chatStore'
import { getCharacter } from '../db'
import type { Character, Message } from '../types'
import { Send, StopCircle, ArrowLeft } from 'lucide-react'

export function ChatPage() {
  const { chatId } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { currentChat, messages, loading, streaming, streamingContent, loadChat, createNewChat, sendMessage, stopStreaming, clearCurrentChat } = useChatStore()
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const [character, setCharacter] = useState<Character | null>(null)

  useEffect(() => {
    const init = async () => {
      if (chatId === 'new') {
        const characterId = searchParams.get('character')
        if (characterId) {
          const char = await getCharacter(characterId)
          if (char) {
            setCharacter(char)
            const newChatId = await createNewChat(characterId)
            navigate(`/chat/${newChatId}`, { replace: true })
          }
        }
      } else if (chatId) {
        await loadChat(chatId)
        if (useChatStore.getState().currentChat) {
          const char = await getCharacter(useChatStore.getState().currentChat!.characterId)
          setCharacter(char || null)
        }
      }
    }
    init()
    return () => clearCurrentChat()
  }, [chatId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streamingContent])

  const handleSend = () => {
    if (!input.trim() || !currentChat || streaming) return
    sendMessage(currentChat.id, currentChat.characterId, input.trim())
    setInput('')
    inputRef.current?.focus()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleQuickAction = (payload: string) => {
    if (!currentChat || streaming) return
    sendMessage(currentChat.id, currentChat.characterId, payload)
  }

  const moodEmoji: Record<string, string> = {
    neutral: '', happy: '😊', sad: '😢', angry: '😠',
    surprised: '😲', thoughtful: '🤔', playful: '😏', serious: '🧐'
  }

  if (!currentChat && chatId !== 'new') {
    return <div className="loading-screen"><p>Чат не найден</p></div>
  }

  return (
    <div className="chat-page">
      <header className="chat-header">
        <button className="back-btn" onClick={() => navigate('/chats')}>
          <ArrowLeft size={20} />
        </button>
        <div className="chat-header-info">
          {character && (
            <>
              <div className="chat-avatar-small">
                {character.avatar ? <img src={character.avatar} alt={character.name} /> : <div className="avatar-placeholder">{character.name[0]}</div>}
              </div>
              <h2>{character.name}</h2>
            </>
          )}
        </div>
      </header>

      <div className="chat-messages">
        {messages.map((msg: Message) => (
          <div key={msg.id} className={`message ${msg.role}`}>
            {msg.role === 'assistant' && (
              <div className="message-avatar">
                {character?.avatar ? <img src={character.avatar} alt="" /> : <div className="avatar-placeholder">{character?.name?.[0] || '?'}</div>}
              </div>
            )}
            <div className="message-content">
              <p>{msg.content}</p>
              {msg.mood && <span className="mood-indicator">{moodEmoji[msg.mood]}</span>}
              {msg.actions && msg.actions.length > 0 && (
                <div className="quick-actions">
                  {msg.actions.map((action, i) => (
                    <button key={i} className="action-btn" onClick={() => handleQuickAction(action.payload)}>
                      {action.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {streaming && streamingContent && (
          <div className="message assistant streaming">
            <div className="message-avatar">
              {character?.avatar ? <img src={character.avatar} alt="" /> : <div className="avatar-placeholder">{character?.name?.[0] || '?'}</div>}
            </div>
            <div className="message-content">
              <p>{streamingContent}<span className="cursor">|</span></p>
            </div>
          </div>
        )}

        {streaming && !streamingContent && (
          <div className="typing-indicator">
            <span>{character?.name} думает</span>
            <div className="dots"><span></span><span></span><span></span></div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-area">
        <textarea
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Напишите сообщение..."
          disabled={streaming}
          rows={1}
        />
        {streaming ? (
          <button className="stop-btn" onClick={stopStreaming}>
            <StopCircle size={20} />
          </button>
        ) : (
          <button className="send-btn" onClick={handleSend} disabled={!input.trim()}>
            <Send size={20} />
          </button>
        )}
      </div>
    </div>
  )
}
