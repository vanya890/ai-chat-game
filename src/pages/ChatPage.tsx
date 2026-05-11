import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useChatStore } from '../stores/chatStore';
import { useCharacterStore } from '../stores/characterStore';
import { useAIStore } from '../stores/aiStore';
import { ArrowLeft, Send, StopCircle } from 'lucide-react';

export default function ChatPage() {
  const { chatId } = useParams();
  const navigate = useNavigate();
  const currentChat = useChatStore(s => s.currentChat);
  const messages = useChatStore(s => s.messages);
  const openChat = useChatStore(s => s.openChat);
  const addMessage = useChatStore(s => s.addMessage);
  const characters = useCharacterStore(s => s.characters);
  const sendMessage = useAIStore(s => s.sendMessage);
  const isStreaming = useAIStore(s => s.isStreaming);
  const stopStreaming = useAIStore(s => s.stopStreaming);
  const error = useAIStore(s => s.error);

  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const character = characters.find(c => c.id === currentChat?.characterId);

  useEffect(() => {
    if (chatId) openChat(chatId);
  }, [chatId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = useCallback(async () => {
    if (!input.trim() || !character || isStreaming) return;
    const text = input.trim();
    setInput('');
    await sendMessage(character, text);
  }, [input, character, isStreaming, sendMessage]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleQuickAction = async (payload: string) => {
    if (!character || isStreaming) return;
    await sendMessage(character, payload);
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
    }
  }, [input]);

  if (!currentChat) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner" />
        <p>Загрузка чата...</p>
      </div>
    );
  }

  return (
    <div className="chat-page">
      <div className="chat-header">
        <button className="back-btn" onClick={() => navigate('/chats')}>
          <ArrowLeft width={20} height={20} />
        </button>
        <div className="chat-header-info">
          <h3>{character?.name || 'Чат'}</h3>
          <span>{character?.description || ''}</span>
        </div>
      </div>

      {error && (
        <div className="error-banner">
          <span>{error}</span>
          <button onClick={() => useAIStore.getState().clearError()}>×</button>
        </div>
      )}

      <div className="chat-messages">
        {messages.map(msg => {
          const parsedActions = msg.actions || [];
          return (
            <div key={msg.id} className={`message ${msg.role}`}>
              <div className="message-avatar">
                {msg.role === 'assistant' ? (character?.avatar || '🤖') : '👤'}
              </div>
              <div className="message-bubble">
                {msg.content}
                {parsedActions.length > 0 && (
                  <div className="message-actions-bar">
                    {parsedActions.map((action, i) => (
                      <button
                        key={i}
                        className="quick-action-btn"
                        onClick={() => handleQuickAction(action.payload)}
                      >
                        {action.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {isStreaming && (
          <div className="message assistant">
            <div className="message-avatar">{character?.avatar || '🤖'}</div>
            <div className="typing-indicator">
              <div className="typing-dot" />
              <div className="typing-dot" />
              <div className="typing-dot" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-area">
        <textarea
          ref={textareaRef}
          className="chat-input"
          placeholder="Напишите сообщение..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isStreaming}
          rows={1}
        />
        {isStreaming ? (
          <button className="stop-btn" onClick={stopStreaming}>
            <StopCircle width={20} height={20} />
          </button>
        ) : (
          <button className="send-btn" onClick={handleSend} disabled={!input.trim()}>
            <Send width={20} height={20} />
          </button>
        )}
      </div>
    </div>
  );
}
