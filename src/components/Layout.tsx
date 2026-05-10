import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { MessageSquare, Users, Settings, Sparkles } from 'lucide-react';

export default function Layout() {
  const location = useLocation();

  const tabs = [
    { path: '/gallery', icon: Sparkles, label: 'Галерея' },
    { path: '/chats', icon: MessageSquare, label: 'Мои чаты' },
    { path: '/characters', icon: Users, label: 'Персонажи' },
    { path: '/settings', icon: Settings, label: 'Настройки' }
  ];

  return (
    <div className="app-layout">
      <header className="app-header">
        <h1>AI Chat Game</h1>
      </header>

      <main className="app-content">
        <Outlet />
      </main>

      <nav className="tab-bar">
        {tabs.map(tab => (
          <NavLink
            key={tab.path}
            to={tab.path}
            className={`tab-item ${location.pathname === tab.path ? 'active' : ''}`}
          >
            <tab.icon />
            <span>{tab.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
