import { Routes, Route, Navigate } from 'react-router-dom'
import { Outlet } from 'react-router-dom'
import { Layout } from './components/Layout'
import { SeedData } from './components/SeedData'
import { GalleryPage } from './pages/GalleryPage'
import { ChatsPage } from './pages/ChatsPage'
import { CharactersPage } from './pages/CharactersPage'
import { ChatPage } from './pages/ChatPage'
import { SettingsPage } from './pages/SettingsPage'
import { useAppStore } from './stores/appStore'
import { useEffect } from 'react'

function AppContent() {
  const { initialized, init } = useAppStore()

  useEffect(() => {
    init()
  }, [init])

  if (!initialized) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Загрузка...</p>
      </div>
    )
  }

  return (
    <>
      <SeedData />
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/gallery" replace />} />
          <Route path="gallery" element={<GalleryPage />} />
          <Route path="chats" element={<ChatsPage />} />
          <Route path="characters" element={<CharactersPage />} />
          <Route path="chat/:chatId" element={<ChatPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </>
  )
}

export default AppContent
