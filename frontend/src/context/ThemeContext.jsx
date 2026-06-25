import { createContext, useContext, useState, useEffect } from 'react'

const ThemeContext = createContext(null)

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'system'
  })

  const [isDark, setIsDark] = useState(() => {
    const savedTheme = localStorage.getItem('theme') || 'system'
    if (savedTheme === 'dark') return true
    if (savedTheme === 'light') return false
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  useEffect(() => {
    const root = document.documentElement
    
    const applyTheme = () => {
      let dark = false
      if (theme === 'dark') {
        dark = true
      } else if (theme === 'system') {
        dark = window.matchMedia('(prefers-color-scheme: dark)').matches
      }
      
      root.classList.toggle('dark', dark)
      setIsDark(dark)
    }

    applyTheme()
    localStorage.setItem('theme', theme)

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = () => {
      if (theme === 'system') {
        applyTheme()
      }
    }
    
    mediaQuery.addEventListener('change', handler)
    return () => mediaQuery.removeEventListener('change', handler)
  }, [theme])

  const toggleDark = () => {
    setTheme(isDark ? 'light' : 'dark')
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, dark: isDark, toggleDark }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)
