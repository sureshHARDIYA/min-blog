'use client'

import Link from 'next/link'
import { LanguageSwitcher } from '../../components/LanguageSwitcher'
import { useLanguage } from '../../i18n/LanguageContext'
import copy from './copy.json'
import { ThemeToggle } from '../../components/ThemeToggle'

import './security.css'
import { SecurityScorecard } from './SecurityScorecard'
import type { SecurityScores } from '../../lib/securityScores'


export function SecurityContent({ scores }: Readonly<{ scores: SecurityScores }>) {
  const { language } = useLanguage()
  const text = copy[language]

  return (
    <main className='security-page min-h-screen bg-[var(--s-bg)] text-[var(--s-ink)]'>
      <nav aria-label={text.navLabel} className='sticky top-0 z-50 border-b border-[var(--s-ink)]/10 bg-[var(--s-bg)]/95 backdrop-blur-md'>
        <div className='mx-auto flex max-w-[1120px] items-center justify-between gap-4 px-6 py-4'>
          <Link className='font-black uppercase tracking-tighter' href='/'>Suresh K. Mukhiya <span className='font-mono text-xs text-[var(--s-accent)]'>.PhD</span></Link>
          <div className='flex items-center gap-4 font-mono text-[11px] uppercase tracking-[0.15em]'>
            <span className='hidden border-b-2 border-[var(--s-accent)] pb-1 font-bold text-[var(--s-accent)] md:inline'>{text.security}</span>
            <Link className='hidden text-[var(--s-ink)]/65 hover:text-[var(--s-ink)] sm:inline' href='/blogs'>{text.blogs}</Link>
            <Link className='hidden text-[var(--s-ink)]/65 hover:text-[var(--s-ink)] sm:inline' href='/connect'>{text.contact}</Link>
            <LanguageSwitcher />
            <ThemeToggle
              lightLabel={language === 'no' ? 'Lyst' : 'Light'}
              darkLabel={language === 'no' ? 'Mørkt' : 'Dark'}
            />
          </div>
        </div>
      </nav>

      <section className='border-b border-[var(--s-ink)]/10 px-6 py-20 md:py-28'><div className='mx-auto max-w-[1120px]'>
        <p className='font-mono text-xs font-bold uppercase tracking-[0.3em] text-[var(--s-accent)]'>{text.eyebrow}</p>
        <h1 className='mt-6 max-w-5xl text-5xl font-black leading-[0.95] tracking-tighter md:text-7xl'>{text.title}</h1>
        <p className='mt-8 max-w-3xl text-xl font-light leading-8 text-[var(--s-ink)]/75 md:text-2xl md:leading-9'>{text.intro}</p>
        <div className='mt-10 flex flex-wrap gap-4'>
          <a className='bg-[var(--s-accent-bg)] px-6 py-3 font-mono text-xs font-bold uppercase tracking-widest text-[var(--s-on-accent)] hover:bg-[var(--s-ink)]' href='mailto:itsmeskm99@gmail.com?subject=Application%20security%20collaboration'>{text.discuss}</a>
          <Link className='border border-[var(--s-ink)]/20 px-6 py-3 font-mono text-xs font-bold uppercase tracking-widest hover:border-[var(--s-accent)] hover:text-[var(--s-accent)]' href='/blog/the-api-knew-who-i-was-authorization'>{text.notes}</Link>
          <Link className='border border-[var(--s-ink)]/20 px-6 py-3 font-mono text-xs font-bold uppercase tracking-widest hover:border-[var(--s-accent)] hover:text-[var(--s-accent)]' href='/vulnerabilities'>Vulnerability Intelligence <span aria-hidden='true'>→</span></Link>
        </div>
      </div></section>

      <section className='px-6 py-20'><div className='mx-auto max-w-[1120px]'>
        <p className='font-mono text-xs font-bold uppercase tracking-[0.25em] text-[var(--s-accent)]'>{text.where}</p>
        <h2 className='mt-3 max-w-3xl text-3xl font-black tracking-tight md:text-5xl'>{text.capabilitiesTitle}</h2>
        <div className='mt-12 grid gap-5 md:grid-cols-2'>{text.capabilities.map(([title, description, focus]) => <article className='border border-[var(--s-ink)]/10 bg-[var(--s-surface)] p-7 transition-colors hover:border-[var(--s-accent)]/60' key={title}><h3 className='text-xl font-bold'>{title}</h3><p className='mt-4 leading-7 text-[var(--s-ink)]/70'>{description}</p><p className='mt-5 font-mono text-xs leading-5 text-[var(--s-accent)]'>{focus}</p></article>)}</div>
      </div></section>

      <section className='border-y border-[var(--s-ink)]/10 bg-[var(--s-band)] px-6 py-20'><div className='mx-auto grid max-w-[1120px] gap-12 lg:grid-cols-12'>
        <div className='lg:col-span-5'><p className='font-mono text-xs font-bold uppercase tracking-[0.25em] text-[var(--s-accent)]'>{text.verification}</p><h2 className='mt-3 text-3xl font-black tracking-tight md:text-4xl'>{text.evidenceTitle}</h2></div>
        <div className='lg:col-span-7'><p className='text-lg leading-8 text-[var(--s-ink)]/75'>{text.evidence1}</p><p className='mt-5 text-lg leading-8 text-[var(--s-ink)]/75'>{text.evidence2}</p></div>
      </div></section>

      <SecurityScorecard scores={scores} text={text.scorecard} />

      <section className='px-6 py-20'><div className='mx-auto max-w-[1120px]'>
        <p className='font-mono text-xs font-bold uppercase tracking-[0.25em] text-[var(--s-accent)]'>{text.method}</p><h2 className='mt-3 text-3xl font-black tracking-tight md:text-5xl'>{text.methodTitle}</h2>
        <div className='mt-12 grid gap-px bg-[var(--s-ink)]/10 md:grid-cols-4'>{text.workflow.map(([title, description], index) => <article className='bg-[var(--s-bg)] p-6' key={title}><span className='font-mono text-xs font-bold text-[var(--s-accent)]'>{String(index + 1).padStart(2, '0')}</span><h3 className='mt-5 text-xl font-bold'>{title}</h3><p className='mt-3 text-sm leading-6 text-[var(--s-ink)]/65'>{description}</p></article>)}</div>
      </div></section>

      <section className='border-t border-[var(--s-ink)]/10 px-6 py-20'><div className='mx-auto max-w-[860px]'><p className='font-mono text-xs font-bold uppercase tracking-[0.25em] text-[var(--s-accent)]'>{text.perspective}</p><h2 className='mt-3 text-3xl font-black tracking-tight'>{text.perspectiveTitle}</h2><p className='mt-5 text-lg leading-8 text-[var(--s-ink)]/70'>{text.perspectiveText}</p></div></section>
      <section className='bg-[var(--s-accent-bg)] px-6 py-16 text-[var(--s-on-accent)]'><div className='mx-auto flex max-w-[1120px] flex-col justify-between gap-8 md:flex-row md:items-center'><div><p className='font-mono text-xs font-bold uppercase tracking-[0.25em]'>{text.ctaLabel}</p><h2 className='mt-3 max-w-2xl text-3xl font-black tracking-tight md:text-4xl'>{text.ctaTitle}</h2></div><a className='shrink-0 border-2 border-[var(--s-on-accent)] px-6 py-3 font-mono text-xs font-bold uppercase tracking-widest hover:bg-[var(--s-on-accent)] hover:text-[var(--s-accent)]' href='mailto:itsmeskm99@gmail.com?subject=Application%20security%20collaboration'>{text.cta}</a></div></section>
    </main>
  )
}
