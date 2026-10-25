'use client'

import Link from 'next/link'
import { useState } from 'react'
import { ThemeProvider, useTheme } from '../context/ThemeContext'

function HeaderContent() {
  const { theme, toggleTheme } = useTheme()
  const [open, setOpen] = useState(false)
  const light = theme === 'light'
  const links = [
    { href: '/', label: 'Home' },
    { href: '/security', label: 'Security' },
    { href: '/blogs', label: 'Blogs' },
    { href: '/vulnerabilities', label: 'VulnIntel' }
  ]
  return <header className={`sticky top-0 z-50 border-b backdrop-blur-md ${light ? 'border-slate-200 bg-white/95 text-slate-900' : 'border-white/10 bg-[#0C0C0C]/95 text-[#F5F5F5]'}`}>
    <div className="mx-auto flex min-h-20 max-w-[1120px] items-center justify-between gap-5 px-6 py-3">
      <Link href="/" className="flex flex-col leading-tight">
        <span className="text-lg font-black uppercase tracking-tight">Suresh K. Mukhiya <span className={light ? 'text-[#008822]' : 'text-[#00FF41]'}>.PhD</span></span>
        <span className="mt-1 font-mono text-[9px] uppercase tracking-[0.15em] opacity-60">Application Security &amp; Architecture</span>
      </Link>
      <nav aria-label="Main navigation" className="hidden items-center gap-6 font-mono text-[11px] uppercase tracking-[0.12em] md:flex">
        {links.map(link => <Link key={link.href} href={link.href} className="opacity-75 transition-opacity hover:opacity-100">{link.label}</Link>)}
      </nav>
      <div className="flex items-center gap-2">
        <button type="button" onClick={toggleTheme} aria-label="Toggle light and dark theme" className={`rounded-full border px-3 py-2 font-mono text-xs ${light ? 'border-green-700 text-green-800' : 'border-[#00FF41]/50 text-[#00FF41]'}`}>System ◐</button>
        <button type="button" aria-label="Toggle navigation menu" aria-expanded={open} onClick={() => setOpen(!open)} className="rounded border border-current/20 px-3 py-2 text-xs md:hidden">Menu</button>
      </div>
    </div>
    {open && <nav aria-label="Mobile navigation" className="flex flex-col border-t border-current/10 px-6 py-3 font-mono text-xs uppercase md:hidden">
      {links.map(link => <Link key={link.href} href={link.href} onClick={() => setOpen(false)} className="py-3">{link.label}</Link>)}
    </nav>}
  </header>
}

export function ContentPageHeader() {
  return <ThemeProvider><HeaderContent /></ThemeProvider>
}
