'use client'

import Link from 'next/link'
import React from 'react'
import { useTheme } from '../context/ThemeContext'
import { Reveal, Stagger, StaggerItem } from './motion-primitives'

export interface HomeBlogPost {
  slug: string
  title: string
  description: string
  date: string
}

const formatDate = (date: string) =>
  new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC'
  }).format(new Date(`${date}T00:00:00Z`))

export const HomeBlogGrid: React.FC<{ posts: HomeBlogPost[] }> = ({ posts }) => {
  const { theme } = useTheme()

  return (
    <section
      aria-labelledby='latest-field-notes'
      className={`border-t pt-12 pb-4 ${
        theme === 'light' ? 'border-slate-300' : 'border-white/10'
      }`}
    >
      <Reveal className='mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between'>
        <div>
          <span
            className={`mb-1 block font-mono text-xs font-bold uppercase tracking-[0.2em] ${
              theme === 'light' ? 'text-[#008822]' : 'text-[#00FF41]'
            }`}
          >
            Latest writing
          </span>
          <h2
            id='latest-field-notes'
            className={`font-headline-lg uppercase ${
              theme === 'light' ? 'text-slate-900' : 'text-[#F5F5F5]'
            }`}
          >
            Field notes
          </h2>
        </div>
        <Link
          href='/blogs'
          className={`group inline-flex items-center gap-2 font-code text-xs font-bold uppercase tracking-widest transition-colors ${
            theme === 'light'
              ? 'text-[#008822] hover:text-slate-900'
              : 'text-[#00FF41] hover:text-[#F5F5F5]'
          }`}
        >
          Browse all posts
          <span
            aria-hidden='true'
            className='material-symbols-outlined text-sm transition-transform group-hover:translate-x-1'
          >
            arrow_forward
          </span>
        </Link>
      </Reveal>

      <Stagger
        gap={0.1}
        className='grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3'
      >
        {posts.slice(0, 6).map((post, index) => (
          <StaggerItem key={post.slug} className='h-full'>
            <article
              className={`group relative flex h-full min-h-72 flex-col border p-6 shadow-sm transition-all duration-300 ${
                theme === 'light'
                  ? 'border-slate-200 bg-white hover:border-[#008822] hover:shadow-md'
                  : 'border-white/10 bg-[#141414] hover:border-[#00FF41]'
              }`}
            >
              <div className='mb-7 flex items-center justify-between gap-4'>
                <time
                  className={`font-code text-xs font-bold uppercase tracking-wider ${
                    theme === 'light' ? 'text-[#008822]' : 'text-[#00FF41]'
                  }`}
                  dateTime={post.date}
                >
                  {formatDate(post.date)}
                </time>
                <span
                  aria-hidden='true'
                  className={`font-code text-xs ${
                    theme === 'light' ? 'text-slate-400' : 'text-white/30'
                  }`}
                >
                  {String(index + 1).padStart(2, '0')}
                </span>
              </div>

              <h3
                className={`font-headline-md transition-colors ${
                  theme === 'light'
                    ? 'text-slate-900 group-hover:text-[#008822]'
                    : 'text-[#F5F5F5] group-hover:text-[#00FF41]'
                }`}
              >
                <Link
                  href={`/blog/${post.slug}`}
                  className='after:absolute after:inset-0'
                >
                  {post.title}
                </Link>
              </h3>
              <p
                className={`mt-4 line-clamp-3 text-sm leading-6 ${
                  theme === 'light' ? 'text-slate-600' : 'text-white/60'
                }`}
              >
                {post.description}
              </p>

              <span
                className={`mt-auto flex items-center gap-2 pt-8 font-code text-xs font-bold uppercase tracking-widest ${
                  theme === 'light' ? 'text-slate-700' : 'text-white/75'
                }`}
              >
                Read note
                <span
                  aria-hidden='true'
                  className='material-symbols-outlined text-sm transition-transform group-hover:translate-x-1'
                >
                  arrow_forward
                </span>
              </span>
            </article>
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  )
}
