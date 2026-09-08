'use client';

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

  return (
    <motion.a
      animate={reducedMotion ? undefined : { opacity: [1, 0.72, 1] }}
      className={`mx-auto mt-8 flex w-[calc(100%-3rem)] max-w-[1120px] items-center justify-between gap-4 border px-5 py-4 transition-colors md:mt-10 ${
        theme === 'light'
          ? 'border-[#008822]/35 bg-[#008822]/5 text-slate-900 hover:bg-[#008822]/10'
          : 'border-[#00FF41]/35 bg-[#00FF41]/5 text-[#F5F5F5] hover:bg-[#00FF41]/10'
      }`}
      href={`/blog/${post.slug}`}
      transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
    >
      <span className="min-w-0">
        <span
          className={`font-code text-[10px] font-bold uppercase tracking-[0.25em] ${
            theme === 'light' ? 'text-[#008822]' : 'text-[#00FF41]'
          }`}
        >
          New AppSec brief
        </span>
        <span className="mt-1 block truncate font-semibold">{post.title}</span>
      </span>
      <span
        className={`material-symbols-outlined shrink-0 ${
          theme === 'light' ? 'text-[#008822]' : 'text-[#00FF41]'
        }`}
      >
        arrow_forward
      </span>
    </motion.a>
  );
}
