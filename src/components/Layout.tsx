import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { MessageSquare, Users, Settings, BarChart3, MessageCircle } from 'lucide-react';

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const isChatPage = location.pathname.startsWith('/chat/');

  const tabs = [
    { path: '/gallery', icon: MessageSquare, label: 'Галерея' },
    { path: '/chats', icon: MessageCircle, label: 'Чаты' },
    { path: '/characters', icon: Users, label: 'Персонажи' },
    { path: '/tokens', icon: BarChart3, label: 'Токены' },
    { path: '/settings', icon: Settings, label: 'Настройки' }
  ];

  if (isChatPage) {
    return <Outlet />;
  }

  return (
    <div className="app-layout">
      <main className="app-content">
        <Outlet />
      </main>
      <nav className="tab-bar">
        {tabs.map(tab => {
          const isActive = location.pathname === tab.path;
          return (
            <button
              key={tab.path}
              className={`tab-btn ${isActive ? 'active' : ''}`}
              onClick={() => navigate(tab.path)}
            >
              <tab.icon width={22} height={22} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
