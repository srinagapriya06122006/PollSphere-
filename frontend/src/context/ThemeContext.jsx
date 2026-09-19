import React, { createContext, useContext, useState, useEffect } from 'react'

const ThemeContext = createContext({
  theme: 'light',
  toggleTheme: () => {},
  setTheme: () => {},
})

const applyThemeToDOM = (themeMode) => {
  const root = document.documentElement
  const body = document.body

  if (themeMode === 'dark') {
    root.classList.add('dark')
    root.classList.remove('light')
    if (body) {
      body.classList.add('dark')
      body.classList.remove('light')
      body.style.backgroundColor = '#020617'
      body.style.color = '#f8fafc'
    }
  } else {
    root.classList.remove('dark')
    root.classList.add('light')
    if (body) {
      body.classList.remove('dark')
      body.classList.add('light')
      body.style.backgroundColor = '#ffffff'
      body.style.color = '#0f172a'
    }
  }
}

const getStoredTheme = () => {
  try {
    const saved = localStorage.getItem('pulsepoll_theme')
    if (saved === 'dark' || saved === 'light') return saved
  } catch (err) {
    console.warn('Failed to read theme from storage', err)
  }
  return 'light'
}

export const ThemeProvider = ({ children }) => {
  const [theme, setThemeState] = useState(getStoredTheme)

  useEffect(() => {
    applyThemeToDOM(theme)
    try {
      localStorage.setItem('pulsepoll_theme', theme)
    } catch (err) {
      console.warn('Failed to save theme', err)
    }
  }, [theme])

  const toggleTheme = () => {
    setThemeState((prevTheme) => {
      const nextTheme = prevTheme === 'dark' ? 'light' : 'dark'
      applyThemeToDOM(nextTheme)
      return nextTheme
    })
  }

  const setTheme = (newTheme) => {
    if (newTheme === 'dark' || newTheme === 'light') {
      applyThemeToDOM(newTheme)
      setThemeState(newTheme)
    }
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)

export default ThemeContext
