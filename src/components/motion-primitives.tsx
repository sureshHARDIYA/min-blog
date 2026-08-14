'use client'

import React from 'react'
import { motion, useReducedMotion, Variants } from 'motion/react'

// Signature easing from the Remotion markup skill: Easing.bezier(0.16, 1, 0.3, 1)
export const EASE_OUT_EXPO: [number, number, number, number] = [0.16, 1, 0.3, 1]

const revealVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: (delay: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay, ease: EASE_OUT_EXPO }
  })
}

interface RevealProps {
  children: React.ReactNode
  delay?: number
  className?: string
  /** Animate on mount instead of on scroll into view */
  onMount?: boolean
}

/** Fade + rise reveal, triggered when scrolled into view (or on mount). */
export const Reveal: React.FC<RevealProps> = ({
  children,
  delay = 0,
  className,
  onMount = false
}) => {
  const reduced = useReducedMotion()

  if (reduced) {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div
      className={className}
      custom={delay}
      variants={revealVariants}
      initial='hidden'
      {...(onMount
        ? { animate: 'visible' }
        : {
            whileInView: 'visible',
            viewport: { once: true, margin: '-60px' }
          })}
    >
      {children}
    </motion.div>
  )
}

interface StaggerProps {
  children: React.ReactNode
  className?: string
  /** Seconds between each child */
  gap?: number
  delay?: number
  onMount?: boolean
}

/** Container that staggers its <StaggerItem> children. */
export const Stagger: React.FC<StaggerProps> = ({
  children,
  className,
  gap = 0.08,
  delay = 0,
  onMount = false
}) => {
  const reduced = useReducedMotion()

  if (reduced) {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div
      className={className}
      initial='hidden'
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: gap, delayChildren: delay } }
      }}
      {...(onMount
        ? { animate: 'visible' }
        : {
            whileInView: 'visible',
            viewport: { once: true, margin: '-60px' }
          })}
    >
      {children}
    </motion.div>
  )
}

export const StaggerItem: React.FC<{
  children: React.ReactNode
  className?: string
  onClick?: () => void
}> = ({ children, className, onClick }) => {
  return (
    <motion.div
      className={className}
      onClick={onClick}
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.6, ease: EASE_OUT_EXPO }
        }
      }}
    >
      {children}
    </motion.div>
  )
}
