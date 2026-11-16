'use client'

import Link from 'next/link'
import React, { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { NAV_TAB_PATHS, NavTab } from '../types'
import { useLanguage } from '../i18n/LanguageContext'
import { useTheme } from '../context/ThemeContext'
import { LanguageSwitcher } from './LanguageSwitcher'
import { ThemeToggle } from './ThemeToggle'
import { EASE_OUT_EXPO } from './motion-primitives'

/** The page the header marks as current. `null` for pages outside the main navigation. */
export type HeaderActive = NavTab | 'blog' | 'security' | null

interface HeaderProps {
  activeTab: HeaderActive
  /** Provided by the single-page app so tab links switch views without a full page load. */
  setActiveTab?: (tab: NavTab) => void
}

interface NavItem {
  key: Exclude<HeaderActive, null>
  label: string
  href: string
  /** Set when the destination is a view inside the single-page app. */
  tab?: NavTab
}

const CAREER_START_YEAR = 2010
const NAV_STAGGER_SECONDS = 0.06

/** Translations store nav labels in capitals; the header sets them in sentence case. */
const sentenceCase = (label: string) =>
  label.charAt(0) + label.slice(1).toLowerCase()

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { t } = useLanguage()
  const { theme } = useTheme()
  const light = theme === 'light'
  const careerYears = new Date().getFullYear() - CAREER_START_YEAR

  const accentClass = light ? 'text-[#008822]' : 'text-[#00FF41]'
  const accentBgClass = light ? 'bg-[#008822]' : 'bg-[#00FF41]'
  const desktopLinkClass = light
    ? 'text-slate-600 hover:text-slate-900'
    : 'text-[#F5F5F5]/60 hover:text-[#F5F5F5]'
  const mobileLinkClass = light
    ? 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
    : 'text-[#F5F5F5]/70 hover:bg-white/5 hover:text-[#F5F5F5]'
  const mobileActiveClass = light
    ? 'bg-[#008822]/10 text-[#008822] font-bold border-l-4 border-[#008822]'
    : 'bg-[#00FF41]/10 text-[#00FF41] font-bold border-l-4 border-[#00FF41]'

  // The same links, in the same order, on every page.
  const navItems: NavItem[] = [
    { key: 'blog', label: t.nav.blog, href: '/blogs' },
    { key: 'security', label: t.nav.security, href: '/security' },
    {
      key: 'research',
      label: t.nav.research,
      href: NAV_TAB_PATHS.research,
      tab: 'research'
    },
    {
      key: 'trajectory',
      label: t.nav.trajectory,
      href: NAV_TAB_PATHS.trajectory,
      tab: 'trajectory'
    },
    {
      key: 'stack',
      label: t.nav.stack,
      href: NAV_TAB_PATHS.stack,
      tab: 'stack'
    },
    {
      key: 'connect',
      label: t.nav.connect,
      href: NAV_TAB_PATHS.connect,
      tab: 'connect'
    }
  ]

  const handleNavClick = (
    event: React.MouseEvent<HTMLAnchorElement>,
    tab?: NavTab
  ) => {
    setMobileMenuOpen(false)

    // Outside the single-page app, and for new-tab clicks, the browser follows the link.
    if (
      !tab ||
      !setActiveTab ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return
    }

    event.preventDefault()
    const nextPath = NAV_TAB_PATHS[tab]

    if (window.location.pathname !== nextPath || window.location.hash) {
      window.history.pushState({}, document.title, nextPath)
    }

    if (window.location.hash) {
      window.dispatchEvent(new Event('hashchange'))
    }

    setActiveTab(tab)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <motion.header
      initial={{ y: -64, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: EASE_OUT_EXPO }}
      className={`backdrop-blur-md fixed top-0 w-full z-50 border-b transition-colors duration-300 ${
        light
          ? 'bg-white/95 border-slate-200 text-slate-900 shadow-sm'
          : 'bg-[#0C0C0C]/90 border-white/10 text-[#F5F5F5]'
      }`}
    >
      <div className='mx-auto flex max-w-[1120px] items-center justify-between gap-4 px-6 py-4'>
        <Link
          href='/'
          onClick={(event) => handleNavClick(event, 'architecture')}
          className={`font-headline-md text-left transition-colors cursor-pointer flex min-w-0 flex-col items-start lg:shrink-0 ${
            light
              ? 'text-slate-900 hover:text-[#008822]'
              : 'text-[#F5F5F5] hover:text-[#00FF41]'
          }`}
        >
          <span className='lg:whitespace-nowrap'>
            Suresh K.{' '}
            <span className='whitespace-nowrap'>
              Mukhiya{' '}
              <span
                className={`ml-0.5 align-middle font-mono text-xs font-normal ${accentClass}`}
              >
                .PhD
              </span>
            </span>
          </span>
          <span
            className={`mt-0.5 font-code text-[8px] font-medium tracking-[0.16em] md:text-[9px] ${
              light ? 'text-slate-500' : 'text-[#F5F5F5]/45'
            }`}
          >
            ENGINEERING SINCE {CAREER_START_YEAR} · {careerYears} YEARS
          </span>
        </Link>

        {/* Desktop navigation */}
        <div className='hidden lg:flex items-center gap-6'>
          <nav
            aria-label='Main navigation'
            className='flex gap-5 text-[14px] font-medium xl:gap-6'
          >
            {navItems.map((item, index) => {
              const isActive = activeTab === item.key
              return (
                <motion.a
                  key={item.key}
                  href={item.href}
                  aria-current={isActive ? 'page' : undefined}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.5,
                    delay: 0.15 + index * NAV_STAGGER_SECONDS,
                    ease: EASE_OUT_EXPO
                  }}
                  onClick={(event) => handleNavClick(event, item.tab)}
                  className={`relative cursor-pointer pb-1 transition-colors duration-200 ${
                    isActive ? `${accentClass} font-bold` : desktopLinkClass
                  }`}
                >
                  {sentenceCase(item.label)}
                  {isActive && (
                    <motion.span
                      layoutId='nav-underline'
                      transition={{ duration: 0.4, ease: EASE_OUT_EXPO }}
                      className={`absolute left-0 right-0 -bottom-px h-[2px] ${accentBgClass}`}
                    />
                  )}
                </motion.a>
              )
            })}
          </nav>

          <LanguageSwitcher />
          <ThemeToggle />
        </div>

        {/* Mobile controls */}
        <div className='lg:hidden flex shrink-0 items-center gap-1'>
          <ThemeToggle />
          <button
            type='button'
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className='grid size-11 cursor-pointer place-items-center focus-visible:outline-2 focus-visible:outline-current'
            aria-expanded={mobileMenuOpen}
            aria-label='Toggle Navigation Menu'
          >
            <span
              aria-hidden='true'
              className='material-symbols-outlined text-2xl'
            >
              {mobileMenuOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: EASE_OUT_EXPO }}
            className={`lg:hidden max-h-[calc(100dvh-5rem)] overflow-y-auto border-b shadow-2xl ${
              light
                ? 'bg-white border-slate-200'
                : 'bg-[#141414] border-white/10'
            }`}
          >
            <div className='px-6 py-4'>
              <nav
                aria-label='Mobile navigation'
                className='flex flex-col gap-3 text-sm font-medium mb-4'
              >
                {navItems.map((item) => {
                  const isActive = activeTab === item.key
                  return (
                    <a
                      key={item.key}
                      href={item.href}
                      aria-current={isActive ? 'page' : undefined}
                      onClick={(event) => handleNavClick(event, item.tab)}
                      className={`py-2.5 px-3 min-h-[44px] rounded flex items-center justify-between cursor-pointer ${
                        isActive ? mobileActiveClass : mobileLinkClass
                      }`}
                    >
                      <span>{sentenceCase(item.label)}</span>
                      {isActive && (
                        <span
                          aria-hidden='true'
                          className='material-symbols-outlined text-sm'
                        >
                          chevron_right
                        </span>
                      )}
                    </a>
                  )
                })}
              </nav>

              <div
                className={`pt-3 border-t ${light ? 'border-slate-200' : 'border-white/10'}`}
              >
                <LanguageSwitcher />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}
