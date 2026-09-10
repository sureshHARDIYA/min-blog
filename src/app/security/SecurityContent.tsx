'use client'

import Link from 'next/link'
import { LanguageSwitcher } from '../../components/LanguageSwitcher'
import { useLanguage } from '../../i18n/LanguageContext'
import copy from './copy.json'


export function SecurityContent() {
  const { language } = useLanguage()
  const text = copy[language]

  return (
    <main className='min-h-screen bg-[#0C0C0C] text-[#F5F5F5]'>
      <nav aria-label={text.navLabel} className='sticky top-0 z-50 border-b border-white/10 bg-[#0C0C0C]/95 backdrop-blur-md'>
        <div className='mx-auto flex max-w-[1120px] items-center justify-between gap-4 px-6 py-4'>
          <Link className='font-black uppercase tracking-tighter' href='/'>Suresh K. Mukhiya <span className='font-mono text-xs text-[#00FF41]'>.PhD</span></Link>
          <div className='flex items-center gap-4 font-mono text-[11px] uppercase tracking-[0.15em]'>
            <span className='hidden border-b-2 border-[#00FF41] pb-1 font-bold text-[#00FF41] md:inline'>{text.security}</span>
            <Link className='hidden text-white/65 hover:text-white sm:inline' href='/blogs'>{text.blogs}</Link>
            <Link className='hidden text-white/65 hover:text-white sm:inline' href='/connect'>{text.contact}</Link>
            <LanguageSwitcher />
          </div>
        </div>
      </nav>

      <section className='border-b border-white/10 px-6 py-20 md:py-28'><div className='mx-auto max-w-[1120px]'>
        <p className='font-mono text-xs font-bold uppercase tracking-[0.3em] text-[#00FF41]'>{text.eyebrow}</p>
        <h1 className='mt-6 max-w-5xl text-5xl font-black leading-[0.95] tracking-tighter md:text-7xl'>{text.title}</h1>
        <p className='mt-8 max-w-3xl text-xl font-light leading-8 text-white/75 md:text-2xl md:leading-9'>{text.intro}</p>
        <div className='mt-10 flex flex-wrap gap-4'>
          <a className='bg-[#00FF41] px-6 py-3 font-mono text-xs font-bold uppercase tracking-widest text-[#0C0C0C] hover:bg-white' href='mailto:itsmeskm99@gmail.com?subject=Application%20security%20collaboration'>{text.discuss}</a>
          <Link className='border border-white/20 px-6 py-3 font-mono text-xs font-bold uppercase tracking-widest hover:border-[#00FF41] hover:text-[#00FF41]' href='/blogs'>{text.notes}</Link>
        </div>
      </div></section>

      <section className='px-6 py-20'><div className='mx-auto max-w-[1120px]'>
        <p className='font-mono text-xs font-bold uppercase tracking-[0.25em] text-[#00FF41]'>{text.where}</p>
        <h2 className='mt-3 max-w-3xl text-3xl font-black tracking-tight md:text-5xl'>{text.capabilitiesTitle}</h2>
        <div className='mt-12 grid gap-5 md:grid-cols-2'>{text.capabilities.map(([title, description, focus]) => <article className='border border-white/10 bg-[#141414] p-7 transition-colors hover:border-[#00FF41]/60' key={title}><h3 className='text-xl font-bold'>{title}</h3><p className='mt-4 leading-7 text-white/70'>{description}</p><p className='mt-5 font-mono text-xs leading-5 text-[#00FF41]'>{focus}</p></article>)}</div>
      </div></section>

      <section className='border-y border-white/10 bg-[#101510] px-6 py-20'><div className='mx-auto grid max-w-[1120px] gap-12 lg:grid-cols-12'>
        <div className='lg:col-span-5'><p className='font-mono text-xs font-bold uppercase tracking-[0.25em] text-[#00FF41]'>{text.verification}</p><h2 className='mt-3 text-3xl font-black tracking-tight md:text-4xl'>{text.evidenceTitle}</h2></div>
        <div className='lg:col-span-7'><p className='text-lg leading-8 text-white/75'>{text.evidence1}</p><p className='mt-5 text-lg leading-8 text-white/75'>{text.evidence2}</p></div>
      </div></section>

      <section className='px-6 py-20'><div className='mx-auto max-w-[1120px]'>
        <p className='font-mono text-xs font-bold uppercase tracking-[0.25em] text-[#00FF41]'>{text.method}</p><h2 className='mt-3 text-3xl font-black tracking-tight md:text-5xl'>{text.methodTitle}</h2>
        <div className='mt-12 grid gap-px bg-white/10 md:grid-cols-4'>{text.workflow.map(([title, description], index) => <article className='bg-[#0C0C0C] p-6' key={title}><span className='font-mono text-xs font-bold text-[#00FF41]'>{String(index + 1).padStart(2, '0')}</span><h3 className='mt-5 text-xl font-bold'>{title}</h3><p className='mt-3 text-sm leading-6 text-white/65'>{description}</p></article>)}</div>
      </div></section>

      <section className='border-t border-white/10 px-6 py-20'><div className='mx-auto max-w-[860px]'><p className='font-mono text-xs font-bold uppercase tracking-[0.25em] text-[#00FF41]'>{text.perspective}</p><h2 className='mt-3 text-3xl font-black tracking-tight'>{text.perspectiveTitle}</h2><p className='mt-5 text-lg leading-8 text-white/70'>{text.perspectiveText}</p></div></section>
      <section className='bg-[#00FF41] px-6 py-16 text-[#071008]'><div className='mx-auto flex max-w-[1120px] flex-col justify-between gap-8 md:flex-row md:items-center'><div><p className='font-mono text-xs font-bold uppercase tracking-[0.25em]'>{text.ctaLabel}</p><h2 className='mt-3 max-w-2xl text-3xl font-black tracking-tight md:text-4xl'>{text.ctaTitle}</h2></div><a className='shrink-0 border-2 border-[#071008] px-6 py-3 font-mono text-xs font-bold uppercase tracking-widest hover:bg-[#071008] hover:text-[#00FF41]' href='mailto:itsmeskm99@gmail.com?subject=Application%20security%20collaboration'>{text.cta}</a></div></section>
    </main>
  )
}
