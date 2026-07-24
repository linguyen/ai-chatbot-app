import React, { createContext, useContext, useMemo, useState } from 'react'

export type DiffColors = {
  added: string
  removed: string
  unchanged: string
  appBg: string
  cardBg: string
}

const lightColors: DiffColors = {
  added: '#dcfce7', // green-50
  removed: '#fee2e2', // red-100
  unchanged: 'transparent',
  appBg: '#f3f4f6', // neutral/gray-100
  cardBg: '#ffffff',
}

const darkColors: DiffColors = {
  added: '#064e3b', // green-900 (darker accent)
  removed: '#7f1d1d', // red-800
  unchanged: 'transparent',
  appBg: '#0f172a', // slate-900
  cardBg: '#020617',
}

type ThemeContextValue = {
  colors: DiffColors
  mode: 'light' | 'dark'
  toggleTheme: () => void
}

type ThemeProviderProps = {
  children: React.ReactNode
  initial?: 'light' | 'dark'
}

const ThemeContext = createContext<ThemeContextValue>({
  colors: lightColors,
  mode: 'light',
  toggleTheme: () => {},
})

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children, initial = 'light' }) => {
  const [mode, setMode] = useState<'light' | 'dark'>(initial)

  const colors = useMemo(() => (mode === 'light' ? lightColors : darkColors), [mode])

  const toggleTheme = () => setMode((m) => (m === 'light' ? 'dark' : 'light'))

  // expose as CSS variables so components/markup can use them in styles
  const style: React.CSSProperties = {
    ['--diff-added' as any]: colors.added,
    ['--diff-removed' as any]: colors.removed,
    ['--diff-unchanged' as any]: colors.unchanged,
    ['--app-bg' as any]: colors.appBg,
    ['--card-bg' as any]: colors.cardBg,
  }

  const value = useMemo(() => ({ colors, mode, toggleTheme }), [colors, mode])

  return (
    <ThemeContext.Provider value={value}>
      <div style={style as React.CSSProperties}>{children}</div>
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)

export default ThemeContext
