'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

interface ArticleRecommendationProps {
  description: string
  href: string
  label: string
  readLabel: string
  title: string
}

export function ArticleRecommendation({
  description,
  href,
  label,
  readLabel,
  title
}: ArticleRecommendationProps) {
  const [visible, setVisible] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    const reveal = () => {
      if (
        window.scrollY >
        Math.min(900, document.documentElement.scrollHeight * 0.18)
      )
        setVisible(true)
    }
    window.addEventListener('scroll', reveal, { passive: true })
    reveal()
    return () => window.removeEventListener('scroll', reveal)
  }, [])

  if (!visible || dismissed) return null

  return (
    <aside className='fixed bottom-4 right-4 z-40 hidden w-[min(24rem,calc(100vw-2rem))] border border-[#00FFd9]/40 bg-[#101510]/95 p-5 text-white shadow-2xl backdrop-blur-md md:block'>
      <button
        aria-label='Close recommendation'
        className='absolute right-3 top-2 text-xl text-white/50 hover:text-white'
        onClick={() => setDismissed(true)}
        type='button'
      >
        ×
      </button>
      <p className='font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-[#00FF41]'>
        {label}
      </p>
      <h2 className='mt-2 pr-5 text-lg font-bold leading-6'>{title}</h2>
      <p className='mt-2 line-clamp-2 text-sm leading-6 text-white/65'>
        {description}
      </p>
      <Link
        className='mt-4 inline-flex font-mono text-xs font-bold uppercase tracking-wider text-cyan-300 hover:text-[#00FF41]'
        href={href}
      >
        {readLabel} →
      </Link>
    </aside>
  )
}
