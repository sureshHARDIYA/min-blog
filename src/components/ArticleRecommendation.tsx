'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'

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

  if (!visible || dismissed) return null

  return (
    <motion.aside
      animate={
        reduceMotion
          ? undefined
          : {
              opacity: 1,
              rotate: [0, 0, -1.5, 1.5, -1, 1, 0, 0],
              scale: [1, 1, 1.025, 1, 1],
              boxShadow: [
                '0 18px 45px rgba(0, 0, 0, 0.45)',
                '0 18px 45px rgba(0, 0, 0, 0.45)',
                '0 18px 52px rgba(0, 255, 65, 0.3)',
                '0 18px 45px rgba(0, 0, 0, 0.45)'
              ]
            }
      }
      className='fixed bottom-4 right-4 z-40 hidden w-[min(19rem,calc(100vw-2rem))] border border-[#00FF41]/55 bg-[#101510]/95 px-4 py-3 text-white backdrop-blur-md md:block'
      initial={reduceMotion ? false : { opacity: 0, scale: 0.86, x: 32, y: 16 }}
      role='complementary'
      transition={
        reduceMotion
          ? undefined
          : {
              opacity: { duration: 0.25 },
              x: { type: 'spring', stiffness: 280, damping: 22 },
              y: { type: 'spring', stiffness: 280, damping: 22 },
              scale: { duration: 2.8, repeat: Infinity, repeatDelay: 2.5 },
              rotate: { duration: 2.8, repeat: Infinity, repeatDelay: 2.5 },
              boxShadow: { duration: 2.8, repeat: Infinity, repeatDelay: 2.5 }
            }
      }
    >
      <button
        aria-label='Close recommendation'
        className='absolute right-2 top-1 text-lg leading-none text-white/45 hover:text-white'
        onClick={() => setDismissed(true)}
        type='button'
      >
        ×
      </button>
      <Link
        aria-label={`Read next: ${title}`}
        className='block pr-5 text-sm font-semibold leading-5 transition-colors hover:text-[#00FF41]'
        href={href}
      >
        {title}{' '}
        <span aria-hidden='true' className='text-[#00FF41]'>
          →
        </span>
      </Link>
    </motion.aside>
  )
}
