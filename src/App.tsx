import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useSettingsStore } from './stores/settingsStore';
import { useCharacterStore } from './stores/characterStore';
import { useChatStore } from './stores/chatStore';
import Layout from './components/Layout';
import Gallery from './pages/Gallery';
import MyChats from './pages/MyChats';
import Characters from './pages/Characters';
import ChatPage from './pages/ChatPage';
import Settings from './pages/Settings';

function App() {
  const loadSettings = useSettingsStore(s => s.loadSettings);
  const loadCharacters = useCharacterStore(s => s.loadCharacters);
  const loadChats = useChatStore(s => s.loadChats);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    Promise.all([
      loadSettings(),
      loadCharacters(),
      loadChats()
    ]).then(() => setIsReady(true));
  }, []);

  if (!isReady) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner" />
        <p>Загрузка...</p>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/gallery" replace />} />
          <Route path="gallery" element={<Gallery />} />
          <Route path="chats" element={<MyChats />} />
          <Route path="characters" element={<Characters />} />
          <Route path="chat/:chatId" element={<ChatPage />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
