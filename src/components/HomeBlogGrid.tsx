'use client'

import Link from 'next/link'
import React from 'react'
import { useTheme } from '../context/ThemeContext'
import {
  BlogPostCard,
  blogPostGridClassName,
  type BlogPostSummary
} from './BlogPostCard'
import { Reveal, Stagger, StaggerItem } from './motion-primitives'

export const HomeBlogGrid: React.FC<{ posts: BlogPostSummary[] }> = ({
  posts
}) => {
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

      <Stagger gap={0.1} className={blogPostGridClassName}>
        {posts.slice(0, 6).map((post) => (
          <StaggerItem key={post.slug} className='h-full'>
            <BlogPostCard post={post} heading='h3' />
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  )
}
