'use client'

import { useLanguage } from '../../i18n/LanguageContext'
import copy from './copy.json'


export function PrivacyContent() {
  const { language } = useLanguage()
  const text = copy[language]
  return <main className='blog-theme-page min-h-screen bg-[#0C0C0C] px-6 pb-20 pt-28 text-[#F5F5F5] md:pt-32'><article className='mx-auto max-w-3xl'>
    <p className='font-code text-xs font-bold uppercase tracking-[0.24em] text-[#00FF41] [html.light_&]:text-[#008822]'>{text.label}</p><h1 className='mt-3 text-4xl font-black tracking-tight md:text-6xl'>{text.title}</h1><p className='mt-4 text-sm text-white/50'>{text.updated}</p>
    <div className='mt-12 space-y-10 text-base leading-8 text-white/75 [html.light_&]:text-slate-700'>{text.sections.map(([title, body]) => <section key={title}><h2 className='text-2xl font-bold text-white [html.light_&]:text-slate-900'>{title}</h2><p className='mt-3'>{body}</p></section>)}</div>
  </article></main>
}
