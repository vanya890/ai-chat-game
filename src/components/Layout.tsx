import { Link, useLocation } from 'react-router-dom'
import { MessageSquare, Users, Settings, Sparkles } from 'lucide-react'

const tabs = [
  { path: '/gallery', label: 'Галерея', icon: Sparkles },
  { path: '/chats', label: 'Мои чаты', icon: MessageSquare },
  { path: '/characters', label: 'Персонажи', icon: Users },
  { path: '/settings', label: 'Настройки', icon: Settings }
]

export function Layout() {
  const location = useLocation()

  return (
    <div className="app-layout">
      <header className="app-header">
        <Link to="/gallery" className="app-logo">
          <Sparkles size={24} />
          <span>AI Chat Game</span>
        </Link>
      </header>

      <main className="app-main">
        <Outlet />
      </main>

      <nav className="app-nav">
        {tabs.map(tab => {
          const Icon = tab.icon
          const isActive = location.pathname === tab.path ||
            (tab.path === '/gallery' && location.pathname === '/')
          return (
            <Link
              key={tab.path}
              to={tab.path}
              className={`nav-item ${isActive ? 'active' : ''}`}
            >
              <Icon size={20} />
              <span>{tab.label}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
