'use client'

import { Moon, Sun } from 'lucide-react'

import { useTheme } from '../context/ThemeContext'
import { useLanguage } from '../i18n/LanguageContext'

const ICON_SIZE = 16

/**
 * The site's only light/dark switch. The icon shows the theme a click switches to,
 * and the accessible name says so in words.
 */
export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const { t } = useLanguage()
  const isDark = theme === 'dark'
  const label = isDark ? t.nav.switchToLight : t.nav.switchToDark

  return (
    <button
      type='button'
      aria-label={label}
      title={label}
      onClick={toggleTheme}
      className='grid size-11 shrink-0 cursor-pointer place-items-center opacity-70 transition-opacity hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-current lg:size-9 lg:border lg:border-current/25'
    >
      {isDark ? (
        <Sun aria-hidden='true' size={ICON_SIZE} />
      ) : (
        <Moon aria-hidden='true' size={ICON_SIZE} />
      )}
    </button>
  )
}
