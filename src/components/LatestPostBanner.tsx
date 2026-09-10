'use client';

import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';

import { useTheme } from '../context/ThemeContext';

export interface LatestPostSummary {
  slug: string;
  title: string;
  date: string;
}

export function LatestPostBanner({ post }: { post: LatestPostSummary }) {
  const { theme } = useTheme();
  const reducedMotion = useReducedMotion();
  const [compact, setCompact] = useState(false);

  useEffect(() => {
    const updatePosition = () => {
      setCompact(window.innerWidth >= 768 && window.scrollY > 240);
    };

    updatePosition();
    window.addEventListener('scroll', updatePosition, { passive: true });
    window.addEventListener('resize', updatePosition);
    return () => {
      window.removeEventListener('scroll', updatePosition);
      window.removeEventListener('resize', updatePosition);
    };
  }, []);

  return (
    <motion.a
      animate={
        reducedMotion
          ? undefined
          : {
              opacity: 1,
              scale: compact ? 1 : [1, 1.008, 1],
              y: 0,
            }
      }
      className={`group overflow-hidden rounded-lg border px-4 py-3 shadow-lg backdrop-blur-md md:px-5 md:py-4 ${
        compact
          ? 'fixed right-4 top-20 z-40 w-[calc(100%-2rem)] max-w-sm md:right-6 md:top-24'
          : 'relative z-30 mx-4 flex md:sticky md:top-20 md:mx-auto md:w-[calc(100%-3rem)] md:max-w-[1120px]'
      } ${
        theme === 'light'
          ? 'border-[#008822]/50 bg-white/95 text-slate-900 hover:border-[#008822]'
          : 'border-[#00FF41]/50 bg-[#07150b]/95 text-[#F5F5F5] hover:border-[#00FF41]'
      }`}
      href={`/blog/${post.slug}`}
      initial={{ opacity: 0, y: -18 }}
      layout
      transition={
        reducedMotion
          ? { duration: 0 }
          : {
              layout: { duration: 0.45 },
              opacity: { duration: 0.45 },
              scale: { duration: 2.4, repeat: Infinity, ease: 'easeInOut' },
              y: { duration: 0.45 },
            }
      }
    >
      {!reducedMotion ? (
        <motion.span
          animate={{ x: ['-120%', '220%'] }}
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/10 to-transparent"
          transition={{ duration: 2.8, repeat: Infinity, repeatDelay: 2.2 }}
        />
      ) : null}

      <span className="relative flex w-full items-center justify-between gap-4">
        <span className="flex min-w-0 items-center gap-3">
          <motion.span
            animate={reducedMotion ? undefined : { opacity: [1, 0.25, 1] }}
            aria-hidden="true"
            className={`h-2.5 w-2.5 shrink-0 rounded-full ${
              theme === 'light' ? 'bg-[#008822]' : 'bg-[#00FF41]'
            }`}
            transition={{ duration: 1.2, repeat: Infinity }}
          />
          <span className="min-w-0">
            <span
              className={`font-code text-[10px] font-bold uppercase tracking-[0.25em] ${
                theme === 'light' ? 'text-[#008822]' : 'text-[#00FF41]'
              }`}
            >
              New AppSec brief
            </span>
            <span className="mt-1 line-clamp-2 block text-sm font-semibold leading-snug md:truncate md:text-base">{post.title}</span>
          </span>
        </span>
        <span
          className={`material-symbols-outlined shrink-0 transition-transform group-hover:translate-x-1 ${
            theme === 'light' ? 'text-[#008822]' : 'text-[#00FF41]'
          }`}
        >
          arrow_forward
        </span>
      </span>
    </motion.a>
  );
}
