import { Outlet } from 'react-router-dom'

export function Layout() {
  return (
    <div className="app-layout">
      <header className="app-header">
        <a href="/gallery" className="app-logo">
          <span>AI Chat Game</span>
        </a>
      </header>

      <main className="app-main">
        <Outlet />
      </main>

      <nav className="app-nav">
        <a href="/gallery" className="nav-item">
          <span>Галерея</span>
        </a>
        <a href="/chats" className="nav-item">
          <span>Мои чаты</span>
        </a>
        <a href="/characters" className="nav-item">
          <span>Персонажи</span>
        </a>
        <a href="/settings" className="nav-item">
          <span>Настройки</span>
        </a>
      </nav>
    </div>
  )
}
