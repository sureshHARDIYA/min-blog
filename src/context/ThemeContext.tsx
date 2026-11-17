'use client'

import React, { createContext, useContext, useState, useLayoutEffect } from 'react'

type Theme = 'dark' | 'light'

interface ThemeContextType {
  theme: Theme
  toggleTheme: () => void
  setTheme: (theme: Theme) => void
}

const STORAGE_KEY = 'app_theme'

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children
}) => {
  const [theme, setTheme] = useState<Theme>('dark')

  useLayoutEffect(() => {
    // Synchronize before the browser paints, preventing a dark flash on navigation.
    // The inline script in the root layout has already applied the saved choice,
    // or the device preference on a first visit, as the `html.light` class.
    const isLight = document.documentElement.classList.contains('light')
    setTheme(isLight ? 'light' : 'dark')
  }, [])

  /** Sets the theme, applies it to the page and remembers the choice. */
  const applyTheme = (newTheme: Theme) => {
    setTheme(newTheme)
    document.documentElement.classList.toggle('light', newTheme === 'light')
    try {
      localStorage.setItem(STORAGE_KEY, newTheme)
    } catch {
      // Storage blocked: the theme still changes for this page view.
    }
  }

  const toggleTheme = () => {
    applyTheme(theme === 'dark' ? 'light' : 'dark')
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme: applyTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
