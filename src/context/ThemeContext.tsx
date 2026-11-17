'use client'

import React, { createContext, useContext, useState, useLayoutEffect } from 'react'

import {
  DEFAULT_THEME,
  THEME_COOKIE_ATTRIBUTES,
  THEME_KEY,
  THEME_SYNC_CLASS,
  type Theme
} from '../lib/theme'

interface ThemeContextType {
  theme: Theme
  toggleTheme: () => void
  setTheme: (theme: Theme) => void
}

interface ThemeProviderProps {
  children: React.ReactNode
  /** The theme the server rendered with, read from the visitor's cookie. */
  initialTheme?: Theme
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

/** Remembers the theme in the browser and in a cookie the server reads on the next request. */
function persistTheme(theme: Theme): void {
  try {
    localStorage.setItem(THEME_KEY, theme)
  } catch {
    // Storage blocked: the cookie below still carries the choice.
  }
  const secure = window.location.protocol === 'https:' ? ';secure' : ''
  document.cookie = `${THEME_KEY}=${theme};${THEME_COOKIE_ATTRIBUTES}${secure}`
}

export function ThemeProvider({
  children,
  initialTheme = DEFAULT_THEME
}: Readonly<ThemeProviderProps>) {
  const [theme, setTheme] = useState<Theme>(initialTheme)

  useLayoutEffect(() => {
    // Normally the server already rendered the right theme from the cookie. On a first
    // visit, or when the cookie is missing, the inline script in the root layout has
    // corrected `html.light` instead, so follow it before the browser paints again.
    const root = document.documentElement
    setTheme(root.classList.contains('light') ? 'light' : 'dark')

    // Let that correction paint without a colour fade, then allow transitions again.
    const frame = requestAnimationFrame(() =>
      requestAnimationFrame(() => root.classList.remove(THEME_SYNC_CLASS))
    )
    return () => cancelAnimationFrame(frame)
  }, [])

  /** Sets the theme, applies it to the page and remembers the choice. */
  const applyTheme = (newTheme: Theme) => {
    setTheme(newTheme)
    document.documentElement.classList.toggle('light', newTheme === 'light')
    persistTheme(newTheme)
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
