'use client'

import Fuse from 'fuse.js'
import { Search, X } from 'lucide-react'
import { useMemo, useRef, useState } from 'react'
import {
  BlogPostCard,
  blogPostGridClassName,
  type BlogPostSummary
} from '../../components/BlogPostCard'
import { LanguageSwitcher } from '../../components/LanguageSwitcher'
import { useTheme } from '../../context/ThemeContext'
import { useLanguage } from '../../i18n/LanguageContext'

const copy = {
  en: {
    title: 'Field notes',
    intro:
      'What I am learning from architecture decisions, security reviews and the less tidy parts of building software.',
    search: 'Search posts',
    placeholder: 'Search by title, topic or category',
    clear: 'Clear search',
    results: (count: number) => `${count} ${count === 1 ? 'post' : 'posts'}`,
    empty: 'No matching posts. Try a different search.',
    read: 'Read note',
    dateLocale: 'en-GB'
  },
  no: {
    title: 'Feltnotater',
    intro:
      'Det jeg lærer av arkitekturbeslutninger, sikkerhetsgjennomganger og de mindre ryddige delene av programvareutvikling.',
    search: 'Søk i innlegg',
    placeholder: 'Søk etter tittel, emne eller kategori',
    clear: 'Tøm søket',
    results: (count: number) => `${count} innlegg`,
    empty: 'Ingen treff. Prøv et annet søk.',
    read: 'Les innlegget',
    dateLocale: 'nb-NO'
  }
}

const searchFields = [
  { name: 'title', weight: 3 },
  { name: 'category', weight: 2 },
  { name: 'description', weight: 1 }
]

export function BlogsContent({ posts }: { posts: BlogPostSummary[] }) {
  const { language } = useLanguage()
  const { theme } = useTheme()
  const [query, setQuery] = useState('')
  const searchInput = useRef<HTMLInputElement>(null)
  const text = copy[language]
  const light = theme === 'light'
  const muted = light ? 'text-slate-600' : 'text-white/65'

  const search = useMemo(
    () =>
      new Fuse(posts, {
        keys: searchFields,
        threshold: 0.31,
        ignoreLocation: true,
        ignoreDiacritics: true
      }),
    [posts]
  )
  const terms = query.trim().split(/\s+/).filter(Boolean)
  const results = terms.length
    ? search
        .search({
          $and: terms.map((term) => ({
            $or: searchFields.map(({ name }) => ({ [name]: term }))
          }))
        })
        .map(({ item }) => item)
    : posts

  function clearSearch() {
    setQuery('')
    searchInput.current?.focus()
  }

  return (
    <main
      className={`dot-grid min-h-screen pt-16 md:pt-20 ${
        light ? 'bg-[#F4F6F8] text-slate-900' : 'bg-[#0C0C0C] text-[#F5F5F5]'
      }`}
    >
      <section
        aria-labelledby='field-notes'
        className='mx-auto max-w-[1120px] px-6 pb-16 pt-10 sm:pt-16'
      >
        <div className='flex flex-wrap items-start justify-between gap-x-8 gap-y-4'>
          <h1 id='field-notes' className='font-display uppercase'>
            {text.title}
          </h1>
          <LanguageSwitcher />
        </div>
        <p className={`font-body-md mt-4 max-w-2xl ${muted}`}>{text.intro}</p>

        <div
          className={`mb-6 mt-9 flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-y py-4 ${
            light ? 'border-slate-300' : 'border-white/10'
          }`}
        >
          <div
            role='search'
            aria-label={text.search}
            className={`relative w-full sm:max-w-md ${muted}`}
          >
            <label htmlFor='blog-search' className='sr-only'>
              {text.search}
            </label>
            <Search
              aria-hidden='true'
              size={18}
              className='pointer-events-none absolute left-3.5 top-3.5'
            />
            <input
              ref={searchInput}
              id='blog-search'
              type='search'
              maxLength={120}
              autoComplete='off'
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Escape' && query) {
                  event.preventDefault()
                  clearSearch()
                }
              }}
              placeholder={text.placeholder}
              className={`h-11 w-full appearance-none border pl-10 pr-11 text-base outline-none transition-colors [&::-webkit-search-cancel-button]:hidden ${
                light
                  ? 'border-slate-300 bg-white text-slate-900 placeholder:text-slate-500 focus:border-[#008822] focus:ring-1 focus:ring-[#008822]'
                  : 'border-white/15 bg-[#141414] text-[#F5F5F5] placeholder:text-white/55 focus:border-[#00FF41] focus:ring-1 focus:ring-[#00FF41]'
              }`}
            />
            {query && (
              <button
                type='button'
                onClick={clearSearch}
                aria-label={text.clear}
                className='absolute right-0 top-0 grid size-11 cursor-pointer place-items-center hover:text-current focus-visible:outline-2 focus-visible:-outline-offset-4'
              >
                <X aria-hidden='true' size={17} />
              </button>
            )}
          </div>

          <p
            role='status'
            aria-atomic='true'
            className={`font-code text-xs ${muted}`}
          >
            {text.results(results.length)}
          </p>
        </div>

        {results.length ? (
          <div className={blogPostGridClassName}>
            {results.map((post) => (
              <BlogPostCard
                key={post.slug}
                post={post}
                heading='h2'
                locale={text.dateLocale}
                readLabel={text.read}
              />
            ))}
          </div>
        ) : (
          <p
            className={`border px-6 py-10 text-center ${
              light
                ? 'border-slate-200 bg-white text-slate-600'
                : 'border-white/10 bg-[#141414] text-white/65'
            }`}
          >
            {text.empty}
          </p>
        )}
      </section>
    </main>
  )
}
