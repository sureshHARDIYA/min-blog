'use client'

import Link from 'next/link'
import { useTheme } from '../context/ThemeContext'
import { BlogPostMetadata } from './BlogPostMetadata'

export interface BlogPostSummary {
  slug: string
  title: string
  description: string
  date: string
  category?: string
}

export const blogPostGridClassName =
  'grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3'

export function BlogPostCard({
  post,
  heading: Heading,
  featuredLabel,
  locale = 'en-GB',
  readLabel = 'Read post'
}: {
  post: BlogPostSummary
  heading: 'h2' | 'h3'
  featuredLabel?: string
  locale?: string
  readLabel?: string
}) {
  const { theme } = useTheme()

  return (
    <article
      className={`group relative flex h-full flex-col border p-6 shadow-sm transition-all duration-300 ${
        featuredLabel ? 'col-span-full sm:p-8' : 'min-h-72'
      } ${
        theme === 'light'
          ? 'border-slate-200 bg-white hover:border-[#008822] focus-within:border-[#008822] hover:shadow-md'
          : 'border-white/10 bg-[#141414] hover:border-[#00FF41] focus-within:border-[#00FF41]'
      }`}
    >
      {featuredLabel && (
        <p
          className={`mb-4 font-code text-xs font-bold uppercase tracking-widest ${
            theme === 'light' ? 'text-[#008822]' : 'text-[#00FF41]'
          }`}
        >
          {featuredLabel}
        </p>
      )}
      <div className='mb-6'>
        <BlogPostMetadata
          date={post.date}
          category={post.category}
          locale={locale}
        />
      </div>

      <Heading
        className={`wrap-break-word transition-colors ${
          featuredLabel ? 'font-headline-lg max-w-4xl' : 'font-headline-md'
        } ${
          theme === 'light'
            ? 'text-slate-900 group-hover:text-[#008822]'
            : 'text-[#F5F5F5] group-hover:text-[#00FF41]'
        }`}
      >
        <Link
          href={`/blog/${post.slug}`}
          className='after:absolute after:inset-0 focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:outline-offset-2 focus-visible:after:outline-current'
        >
          {post.title}
        </Link>
      </Heading>
      <p
        className={`mt-4 ${
          featuredLabel
            ? 'font-body-sm max-w-3xl'
            : 'line-clamp-3 text-sm leading-6'
        } ${theme === 'light' ? 'text-slate-600' : 'text-white/60'}`}
      >
        {post.description}
      </p>

      <span
        className={`mt-auto flex items-center gap-2 pt-8 font-code text-xs font-bold uppercase tracking-widest ${
          theme === 'light' ? 'text-slate-700' : 'text-white/75'
        }`}
      >
        {readLabel}
        <span
          aria-hidden='true'
          className='material-symbols-outlined text-sm transition-transform group-hover:translate-x-1'
        >
          arrow_forward
        </span>
      </span>
    </article>
  )
}
