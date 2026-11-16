'use client'

import { useEffect, useState } from 'react'

const ROTATE_MS = 3000

/**
 * Cycles through short phrases with a rise-and-fade transition.
 * Screen readers and reduced-motion users get the first phrase only.
 */
export function RotatingPhrase({ phrases }: Readonly<{ phrases: string[] }>) {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (
      phrases.length < 2 ||
      matchMedia('(prefers-reduced-motion: reduce)').matches
    )
      return
    const timer = setInterval(
      () => setIndex((current) => (current + 1) % phrases.length),
      ROTATE_MS
    )
    return () => clearInterval(timer)
  }, [phrases.length])

  return (
    <>
      <span className='home-sr-only'>{phrases[0]}</span>
      <span className='home-phrase' aria-hidden='true' key={index}>
        {phrases[index % phrases.length]}
      </span>
    </>
  )
}
