'use client'

import React, { useEffect, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'

export interface CarouselSlide {
  id: string
  label: string
  content: React.ReactNode
}

interface SlowCarouselProps {
  ariaLabel: string
  initialIndex?: number
  intervalMs?: number
  slides: CarouselSlide[]
}

export const SlowCarousel: React.FC<SlowCarouselProps> = ({
  ariaLabel,
  initialIndex = 0,
  intervalMs = 12000,
  slides
}) => {
  const [activeIndex, setActiveIndex] = useState(() =>
    Math.min(Math.max(initialIndex, 0), Math.max(slides.length - 1, 0))
  )
  const [paused, setPaused] = useState(false)
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    if (paused || reducedMotion || slides.length < 2) return

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % slides.length)
    }, intervalMs)

    return () => window.clearInterval(timer)
  }, [intervalMs, paused, reducedMotion, slides.length])

  const show = (index: number) => {
    setActiveIndex((index + slides.length) % slides.length)
  }

  const activeSlide = slides[activeIndex]

  return (
    <section
      aria-label={ariaLabel}
      aria-roledescription='carousel'
      className='relative'
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setPaused(false)
      }}
      onFocus={() => setPaused(true)}
    >
      <div>
        <AnimatePresence initial={false} mode='wait'>
          <motion.div
            animate={{ opacity: 1, x: 0 }}
            aria-label={activeSlide.label}
            aria-roledescription='slide'
            exit={reducedMotion ? { opacity: 0 } : { opacity: 0, x: -20 }}
            initial={reducedMotion ? { opacity: 0 } : { opacity: 0, x: 20 }}
            key={activeSlide.id}
            transition={{ duration: reducedMotion ? 0.15 : 0.6, ease: 'easeInOut' }}
          >
            {activeSlide.content}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className='mt-5 flex items-center justify-center gap-4 font-code'>
        <button
          aria-label='Show previous slide'
          className='p-2 opacity-55 transition-opacity hover:opacity-100 focus-visible:opacity-100'
          onClick={() => show(activeIndex - 1)}
          type='button'
        >
          <span aria-hidden='true'>←</span>
        </button>

        <div className='flex items-center gap-2' role='tablist' aria-label='Carousel slides'>
          {slides.map((slide, index) => (
            <button
              aria-label={`Show ${slide.label}`}
              aria-selected={index === activeIndex}
              className={`h-2 transition-all duration-300 ${
                index === activeIndex ? 'w-8 bg-[#00FF41]' : 'w-2 bg-current opacity-25'
              }`}
              key={slide.id}
              onClick={() => show(index)}
              role='tab'
              type='button'
            />
          ))}
        </div>

        <button
          aria-label='Show next slide'
          className='p-2 opacity-55 transition-opacity hover:opacity-100 focus-visible:opacity-100'
          onClick={() => show(activeIndex + 1)}
          type='button'
        >
          <span aria-hidden='true'>→</span>
        </button>
      </div>
    </section>
  )
}
