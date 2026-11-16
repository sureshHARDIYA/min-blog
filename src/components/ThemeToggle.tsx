'use client'

import { useEffect, useState } from 'react'

const STORAGE_KEY = 'app_theme'

/**
 * Light/dark switch for pages that are not wrapped in the app's ThemeProvider.
 * It uses the same `html.light` class and storage key, so the choice carries across the site.
 */
export function ThemeToggle({ lightLabel, darkLabel }: Readonly<{ lightLabel: string; darkLabel: string }>) {
  const [isLight, setIsLight] = useState(false)

  useEffect(() => {
    setIsLight(document.documentElement.classList.contains('light'))
  }, [])

  const toggle = () => {
    const next = !isLight
    setIsLight(next)
    document.documentElement.classList.toggle('light', next)
    try {
      localStorage.setItem(STORAGE_KEY, next ? 'light' : 'dark')
    } catch {
      // Storage blocked: the theme still changes for this page view.
    }
  }

  return (
    <button
      className='border border-[var(--s-ink)]/20 px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-[var(--s-ink)]/65 transition-colors hover:border-[var(--s-ink)]/50 hover:text-[var(--s-ink)]'
      onClick={toggle}
      type='button'
    >
      {isLight ? darkLabel : lightLabel}
    </button>
  )
}
