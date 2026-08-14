'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useReducedMotion } from 'motion/react';

interface CyclingTextProps {
  /** Full phrase, e.g. "SYSTEMARKITEKT, CYBERSIKKERHET & PhD" */
  text: string;
  className?: string;
  /** ms per typed character */
  typeSpeed?: number;
  /** ms per erased character */
  eraseSpeed?: number;
  /** ms to hold a fully typed word */
  holdMs?: number;
}

/**
 * Terminal-style typewriter that cycles through the comma/&-separated
 * parts of a phrase. Falls back to the static phrase when the user
 * prefers reduced motion.
 */
export const CyclingText: React.FC<CyclingTextProps> = ({
  text,
  className,
  typeSpeed = 55,
  eraseSpeed = 30,
  holdMs = 2200,
}) => {
  const reduced = useReducedMotion();

  const words = useMemo(
    () =>
      text
        .split(/[,&]/)
        .map((w) => w.trim())
        .filter(Boolean),
    [text]
  );

  const [wordIndex, setWordIndex] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [phase, setPhase] = useState<'typing' | 'holding' | 'erasing'>('typing');

  useEffect(() => {
    setWordIndex(0);
    setCharCount(0);
    setPhase('typing');
  }, [text]);

  useEffect(() => {
    if (reduced || words.length < 2) {
      return;
    }

    const word = words[wordIndex] ?? '';
    let timeout: ReturnType<typeof setTimeout>;

    if (phase === 'typing') {
      if (charCount < word.length) {
        timeout = setTimeout(() => setCharCount((c) => c + 1), typeSpeed);
      } else {
        timeout = setTimeout(() => setPhase('erasing'), holdMs);
      }
    } else if (phase === 'erasing') {
      if (charCount > 0) {
        timeout = setTimeout(() => setCharCount((c) => c - 1), eraseSpeed);
      } else {
        timeout = setTimeout(() => {
          setWordIndex((i) => (i + 1) % words.length);
          setPhase('typing');
        }, 250);
      }
    }

    return () => clearTimeout(timeout);
  }, [reduced, words, wordIndex, charCount, phase, typeSpeed, eraseSpeed, holdMs]);

  if (reduced || words.length < 2) {
    return <span className={className}>{text}</span>;
  }

  const word = words[wordIndex] ?? '';

  return (
    <span className={className} aria-label={text}>
      <span aria-hidden='true'>
        {word.slice(0, charCount)}
        <span className='animate-pulse'>▌</span>
      </span>
    </span>
  );
};
