import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import ReactMarkdown, { type Components } from 'react-markdown'

import { BlogCode, BlogList, BlogListItem } from '../../../components/BlogCode'
import { ArticleRecommendation } from '../../../components/ArticleRecommendation'
import { getAllPosts, getPost } from '../../../lib/blog'

interface BlogPostPageProps {
  params: Promise<{ slug: string }>
}

const siteUrl = 'https://www.skmukhiya.com.np'
const appSecSignupUrl =
  'https://c073d8d8.sibforms.com/serve/MUIFAMIAQwwo1-91P5eaP1hpe1U4hufEDLms-syqqX9AMdMzjCo_QWtu5CGZKIYZAoNPxUwQqxe-oSz8CLXMST06LqkubO-9Yjuz_rcdRfs2z5EunEBMMLxSnwe9zXS54nPGOTkhYlc8J4S6AN-mnpl1esZ0ZoDBA6yV1JUR0S4jNXLElPmqfPthLDIukv_Ds9nB0NMb8K07JxOk-g=='

const MARKDOWN_COMPONENTS: Components = {
  h2: ({ children }) => <h2>{children}</h2>,
  h3: ({ children }) => <h3>{children}</h3>,
  p: ({ children }) => <p>{children}</p>,
  ol: ({ children }) => <ol>{children}</ol>,
  ul: BlogList,
  li: BlogListItem,
  pre: ({ children }) => <>{children}</>,
  code: BlogCode,
  a: ({ children, href }) => (
    <a
      href={href}
      rel='noreferrer'
      target={href?.startsWith('http') ? '_blank' : undefined}
    >
      {children}
    </a>
  ),
  blockquote: ({ children }) => <blockquote>{children}</blockquote>
}

const TWO_COLUMN_SECTIONS = new Set(['Security depth across the screen'])

function markdownSections(markdown: string) {
  return markdown.split(/(?=^## )/m).filter(Boolean)
}

function sectionTitle(markdown: string) {
  return /^## (.+)$/m.exec(markdown)?.[1]?.trim() ?? ''
}

function serializeJsonLd(value: object) {
  return JSON.stringify(value).replaceAll('<', '\\u003c')
}

export async function generateStaticParams() {
  const posts = await getAllPosts()
  return posts.map(({ slug }) => ({ slug }))
}

export async function generateMetadata({
  params
}: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params
  const post = await getPost(slug)
  if (!post) return {}

  const url = `${siteUrl}/blog/${post.slug}`
  const seoTitle = post.seoTitle ?? post.title
  const seoDescription = post.seoDescription ?? post.description

  return {
    title: { absolute: seoTitle },
    description: seoDescription,
    authors: [{ name: 'Suresh Kumar Mukhiya', url: siteUrl }],
    alternates: { canonical: url },
    openGraph: {
      type: 'article',
      url,
      title: seoTitle,
      description: seoDescription,
      publishedTime: post.date,
      authors: [siteUrl]
    },
    twitter: {
      card: 'summary',
      title: seoTitle,
      description: seoDescription
    }
  }
}

async function BlogPostContent({ slug }: { slug: string }) {
  const post = await getPost(slug)
  if (!post) notFound()
  const posts = await getAllPosts()
  const currentIndex = posts.findIndex((candidate) => candidate.slug === slug)
  const newerPost = currentIndex > 0 ? posts[currentIndex - 1] : undefined
  const olderPost = currentIndex >= 0 ? posts[currentIndex + 1] : undefined
  const recommendation = olderPost ?? newerPost
  const articleHref = (targetSlug: string) => `/blog/${targetSlug}`

  const url = `${siteUrl}/blog/${post.slug}`
  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    '@id': `${url}#article`,
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    dateModified: post.date,
    mainEntityOfPage: url,
    author: { '@id': `${siteUrl}/#person` },
    isPartOf: { '@id': `${siteUrl}/#website` }
  }

  return (
    <main className='min-h-screen bg-[#0C0C0C] px-5 py-16 text-[#F5F5F5] sm:px-8 lg:px-12 lg:py-20'>
      <script
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(articleJsonLd) }}
        type='application/ld+json'
      />
      <article className='mx-auto max-w-6xl'>
        <div className='mx-auto max-w-5xl'>
          <Link className='text-sm text-cyan-400 hover:underline' href='/blogs'>
            ← All posts
          </Link>

          <header className='mt-10 border-b border-white/10 pb-10'>
            <p className='text-sm font-semibold uppercase tracking-[0.2em] text-cyan-400'>
              Architecture &amp; AppSec
            </p>
            <h1 className='mt-4 text-[2.025rem] font-bold tracking-tight sm:text-[2.7rem] lg:text-[4.05rem]'>
              {post.title}
            </h1>
            <time
              className='mt-5 block text-lg text-white/65'
              dateTime={post.date}
            >
              {new Intl.DateTimeFormat('en-GB', {
                dateStyle: 'long',
                timeZone: 'UTC'
              }).format(new Date(`${post.date}T00:00:00Z`))}
            </time>
          </header>
        </div>

        <div className='blog-prose mt-12 text-lg leading-8 text-white/80'>
          {markdownSections(post.content).map((section) => {
            const title = sectionTitle(section)
            return (
              <section
                className={
                  title === 'Build it safely with AI'
                    ? 'blog-ai-playbook'
                    : TWO_COLUMN_SECTIONS.has(title)
                      ? 'blog-two-column-section'
                      : undefined
                }
                key={title || 'introduction'}
              >
                <ReactMarkdown components={MARKDOWN_COMPONENTS}>
                  {section}
                </ReactMarkdown>
              </section>
            )
          })}
        </div>
        {post.slug.startsWith('appsec-') ? (
          <aside
            aria-labelledby='appsec-subscribe-title'
            className='mx-auto mt-16 max-w-5xl border border-cyan-400/30 bg-cyan-400/[0.06] p-6 sm:p-8'
          >
            <p className='font-mono text-xs font-semibold uppercase tracking-[0.2em] text-cyan-400'>
              Weekly engineering signal
            </p>
            <h2
              className='mt-3 text-2xl font-bold tracking-tight sm:text-3xl'
              id='appsec-subscribe-title'
            >
              Get the Monday AppSec Brief
            </h2>
            <p className='mt-3 max-w-3xl text-base leading-7 text-white/70 sm:text-lg'>
              Consequential application-security and software supply-chain
              developments for developers, Tech Leads and architects—delivered
              weekly.
            </p>
            <form
              action={appSecSignupUrl}
              className='mt-6 flex max-w-2xl flex-col gap-3 sm:flex-row'
              method='POST'
              target='_blank'
            >
              <label className='sr-only' htmlFor='appsec-subscribe-email'>
                Email address
              </label>
              <input
                autoComplete='email'
                className='min-h-12 flex-1 border border-white/20 bg-[#0C0C0C] px-4 text-base text-white outline-none placeholder:text-white/40 focus:border-cyan-400'
                id='appsec-subscribe-email'
                name='EMAIL'
                placeholder='you@example.com'
                required
                type='email'
              />
              <input
                aria-hidden='true'
                autoComplete='off'
                className='hidden'
                name='email_address_check'
                tabIndex={-1}
                type='text'
              />
              <input name='locale' type='hidden' value='en' />
              <input name='html_type' type='hidden' value='simple' />
              <button
                className='min-h-12 bg-cyan-400 px-5 py-3 font-semibold text-[#071013] transition-colors hover:bg-cyan-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-300'
                type='submit'
              >
                Subscribe free →
              </button>
            </form>
            <p className='mt-4 text-sm text-white/50'>
              Subscription and confirmation are handled securely by Brevo.
              Unsubscribe at any time.
            </p>
          </aside>
        ) : null}
        <nav
          aria-label='Article navigation'
          className='mt-16 grid gap-4 border-t border-white/10 pt-8 sm:grid-cols-2'
        >
          <div>
            {olderPost ? (
              <Link
                className='block h-full border border-white/10 bg-white/[0.03] p-5 transition-colors hover:border-cyan-400/60'
                href={articleHref(olderPost.slug)}
              >
                <span className='font-mono text-[10px] uppercase tracking-widest text-cyan-400'>
                  ← Previous article
                </span>
                <strong className='mt-3 block text-lg leading-6'>
                  {olderPost.title}
                </strong>
              </Link>
            ) : null}
          </div>
          <div>
            {newerPost ? (
              <Link
                className='block h-full border border-white/10 bg-white/[0.03] p-5 text-right transition-colors hover:border-cyan-400/60'
                href={articleHref(newerPost.slug)}
              >
                <span className='font-mono text-[10px] uppercase tracking-widest text-cyan-400'>
                  Next article →
                </span>
                <strong className='mt-3 block text-lg leading-6'>
                  {newerPost.title}
                </strong>
              </Link>
            ) : null}
          </div>
        </nav>
      </article>
      {recommendation ? (
        <ArticleRecommendation
          href={articleHref(recommendation.slug)}
          title={recommendation.title}
        />
      ) : null}
    </main>
  )
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params
  return <BlogPostContent slug={slug} />
}
