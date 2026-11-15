'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'

interface ArticleRecommendationProps {
  href: string
  title: string
}

export function ArticleRecommendation({
  href,
  title
}: ArticleRecommendationProps) {
  const [visible, setVisible] = useState(false)
  const [dismissed, setDismissed] = useState(false)
  const reduceMotion = useReducedMotion()

  useEffect(() => {
    const reveal = () => {
      const page = document.documentElement
      const scrollableDistance = page.scrollHeight - window.innerHeight
      const progress =
        scrollableDistance > 0 ? window.scrollY / scrollableDistance : 1

      setVisible(progress >= 0.88)
    }
    window.addEventListener('scroll', reveal, { passive: true })
    reveal()
    return () => window.removeEventListener('scroll', reveal)
  }, [])

  return (
    <AnimatePresence>
      {visible && !dismissed ? (
        <motion.aside
          animate={reduceMotion ? undefined : { opacity: 1 }}
          className='fixed bottom-20 right-6 z-40 hidden w-[min(19rem,calc(100vw-3rem))] border border-[var(--article-border)] bg-[var(--article-surface)] px-4 py-3 text-[var(--article-text)] shadow-lg md:block'
          exit={reduceMotion ? undefined : { opacity: 0 }}
          initial={reduceMotion ? false : { opacity: 0 }}
          role='complementary'
          transition={{ duration: 0.2 }}
        >
          <button
            aria-label='Close recommendation'
            className='absolute right-2 top-1 text-lg leading-none text-[var(--article-muted)] hover:text-[var(--article-text)]'
            onClick={() => setDismissed(true)}
            type='button'
          >
            ×
          </button>
          <Link
            aria-label={`Read next: ${title}`}
            className='block pr-5 text-sm font-semibold leading-5 transition-colors hover:text-[var(--article-accent)]'
            href={href}
          >
            {title}{' '}
            <span aria-hidden='true' className='article-accent'>
              →
            </span>
          </Link>
        </motion.aside>
      ) : null}
    </AnimatePresence>
  )
}
