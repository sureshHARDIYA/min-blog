import type { Metadata } from 'next'
import Link from 'next/link'

import { SiteChrome } from '../components/SiteChrome'
import { getAllPosts } from '../lib/blog'

export const metadata: Metadata = {
  title: 'Page not found | Suresh Kumar Mukhiya, PhD',
  robots: { index: false }
}

const SUGGESTED_POST_COUNT = 3
const PRIMARY_CTA =
  'bg-[#00FF41] px-6 py-3 font-code text-xs font-bold uppercase tracking-wider text-[#0C0C0C] transition-colors hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#00FF41]'
const SECONDARY_CTA =
  'border border-white/20 px-6 py-3 font-code text-xs font-bold uppercase tracking-wider text-[#F5F5F5] transition-colors hover:border-[#00FF41] hover:text-[#00FF41] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#00FF41]'

export default async function NotFound() {
  const posts = (await getAllPosts()).slice(0, SUGGESTED_POST_COUNT)

  return (
    <SiteChrome active={null}>
      <main className='relative min-h-screen overflow-hidden bg-[#0C0C0C] px-6 pb-20 pt-28 text-[#F5F5F5] md:pt-32'>
        {/* Dot grid and oversized numerals echo the home page's terminal look. */}
        <div
          aria-hidden='true'
          className='pointer-events-none absolute inset-0 opacity-40 [background-image:radial-gradient(rgb(255_255_255/0.12)_1px,transparent_1px)] [background-size:28px_28px]'
        />
        <p
          aria-hidden='true'
          className='pointer-events-none absolute -right-6 -top-10 select-none font-code text-[38vw] font-black leading-none text-white/[0.035] md:text-[22rem]'
        >
          404
        </p>

        <div className='relative mx-auto max-w-3xl'>
          <p className='font-code text-xs font-bold uppercase tracking-[0.24em] text-[#00FF41]'>
            Error 404 · Route not found
          </p>
          <h1 className='mt-3 text-4xl font-black tracking-tight md:text-6xl'>
            This page is off the map.
          </h1>
          <p className='mt-5 max-w-xl text-base leading-8 text-white/75'>
            The address may be mistyped, or the page may have moved. Nothing is
            broken on your side. Pick up from one of these instead.
          </p>

          <nav
            aria-label='Where to go next'
            className='mt-9 flex flex-wrap gap-3'
          >
            <Link className={PRIMARY_CTA} href='/'>
              Back to home
            </Link>
            <Link className={SECONDARY_CTA} href='/blogs'>
              Read the blog
            </Link>
            <Link className={SECONDARY_CTA} href='/connect'>
              Get in touch
            </Link>
          </nav>

          {posts.length > 0 && (
            <section
              aria-labelledby='not-found-latest'
              className='mt-16 border-t border-white/10 pt-8'
            >
              <h2
                className='font-code text-xs font-bold uppercase tracking-[0.15em] text-white/60'
                id='not-found-latest'
              >
                Latest posts
              </h2>
              <ul className='mt-4 divide-y divide-white/10'>
                {posts.map((post) => (
                  <li key={post.slug}>
                    <Link
                      className='group flex items-baseline justify-between gap-6 py-4 transition-colors hover:text-[#00FF41] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#00FF41]'
                      href={`/blog/${post.slug}`}
                    >
                      <span className='text-lg font-bold leading-snug'>
                        {post.title}
                      </span>
                      <span
                        aria-hidden='true'
                        className='font-code text-xs text-white/40 transition-transform group-hover:translate-x-1 group-hover:text-[#00FF41]'
                      >
                        →
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </main>
    </SiteChrome>
  )
}
