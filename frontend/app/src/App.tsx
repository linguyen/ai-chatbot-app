import './App.css'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { DashboardPage } from './features/dashboard/components/DashboardPage'
import { ChatPage } from './features/chat/components/ChatPage'
import { AuthPage } from './features/auth/components/AuthPage'
import MainLayout from './layouts/MainLayout'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/dashboard" element={<MainLayout><DashboardPage /></MainLayout>} />
        <Route path="/chat" element={<MainLayout><ChatPage /></MainLayout>} />
        <Route path="/chat/:code" element={<MainLayout><ChatPage /></MainLayout>} />
        <Route path="/auth" element={<MainLayout><AuthPage /></MainLayout>} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
