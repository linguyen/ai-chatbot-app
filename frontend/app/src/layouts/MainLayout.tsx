import React, { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import LanguageSwitcher from '../components/LanguageSwitcher'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import { FiSun, FiMoon, FiArrowLeft } from 'react-icons/fi'
import 'react-i18next'
import QRGenerator from '../components/QRGenerator'
import { BsQrCodeScan } from 'react-icons/bs'

const ACTIVE_CHAT_SESSION_KEY = 'activeChatCode'
const CHAT_MESSAGES_SESSION_PREFIX = 'chatMessages:'

type Props = {
  children: React.ReactNode
}

const ThemeButton: React.FC = () => {
  const { mode, toggleTheme } = useTheme()
  return (
    <button onClick={toggleTheme} className="btn btn-ghost btn-square" aria-label="Toggle theme">
      {mode === 'light' ? <FiMoon size={18} /> : <FiSun size={18} />}
    </button>
  )
}

const MainLayout: React.FC<Props> = ({ children }) => {
  const { t } = useTranslation()
  const location = useLocation()
  const navigate = useNavigate()
  const [qrOpen, setQrOpen] = useState(false)

  const isChat = useMemo(() => location.pathname.startsWith('/chat'), [location.pathname])
  const chatCode = useMemo(() => {
    const m = location.pathname.match(/\/chat\/(.+)/)
    return m && m[1] ? decodeURIComponent(m[1]) : ''
  }, [location.pathname])

  useEffect(() => {
    const activeCode = sessionStorage.getItem(ACTIVE_CHAT_SESSION_KEY)
    if (!activeCode) return

    const isChatWithCode = /^\/chat\/.+/.test(location.pathname)
    const isBareChat = location.pathname === '/chat'
    if (isChatWithCode || isBareChat) return

    navigate(`/chat/${encodeURIComponent(activeCode)}`, { replace: true })
  }, [location.pathname, navigate])

  const handleBackFromChat = () => {
    const activeCode = sessionStorage.getItem(ACTIVE_CHAT_SESSION_KEY)
    const targetCode = activeCode || chatCode
    if (targetCode) {
      sessionStorage.removeItem(`${CHAT_MESSAGES_SESSION_PREFIX}${targetCode}`)
    }

    sessionStorage.removeItem(ACTIVE_CHAT_SESSION_KEY)
    navigate('/dashboard')
  }

  return (
    <main className="min-h-screen p-4 md:p-8" style={{ backgroundColor: 'var(--app-bg)' }}>
      <section className="mx-auto flex h-[calc(100vh-2rem)] w-full max-w-5xl flex-col overflow-hidden rounded-box border border-base-300 shadow-xl md:h-[calc(100vh-4rem)]" style={{ backgroundColor: 'var(--card-bg)' }}>
        <header className="navbar border-b border-base-300 px-4">
          <div className="flex-1 overflow-y-auto p-4 md:p-6">

            {/* Show on Dashboard and Signin */}

            <div className="mx-auto flex w-full max-w-3xl flex-col gap-4">
              {/* Show nav on non-chat pages */}
              {!isChat ? (
                <nav>
                  <ul className="menu menu-horizontal rounded-box bg-base-200 px-2 py-1">
                    <li>
                      <NavLink to="/dashboard" className={({ isActive }) => (isActive ? 'active' : '')}>{t("dashboard")}</NavLink>
                    </li>
                    <li>
                      <NavLink to="/chat" className={({ isActive }) => (isActive ? 'active' : '')}>{t("chat")}</NavLink>
                    </li>
                    <li>
                      <NavLink to="/auth" className={({ isActive }) => (isActive ? 'active' : '')}>{t("signIn")}</NavLink>
                    </li>
                  </ul>
                </nav>
              ) : (
                // Show QR generator and back on chat pages
                <div className="p-3 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <button className="btn btn-ghost btn-sm border border-base-300 bg-base-200" onClick={handleBackFromChat}>
                      <FiArrowLeft size={18} />
                    </button>
                    <button className="btn btn-outline btn-sm border border-base-300" onClick={() => setQrOpen(true)}>
                      <BsQrCodeScan size={18} />
                    </button>
                    {qrOpen && (
                      <QRGenerator initialCode={chatCode ?? ''} onClose={() => setQrOpen(false)} />
                    )}
                  </div>
                </div>
              )}
            </div>

          </div>
          <div className="flex-none">
            <LanguageSwitcher />
          </div>
          <div className="flex-none">
            <ThemeButton />
          </div>
          
        </header>

        {children}

      </section>
    </main>
  )
}

export default MainLayout
