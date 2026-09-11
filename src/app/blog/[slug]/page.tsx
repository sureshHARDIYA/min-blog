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

const siteUrl = 'https://skmukhiya.com.np'

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

  return {
    title: post.title,
    description: post.description,
    authors: [{ name: 'Suresh Kumar Mukhiya', url: siteUrl }],
    alternates: { canonical: url },
    openGraph: {
      type: 'article',
      url,
      title: post.title,
      description: post.description,
      publishedTime: post.date,
      authors: [siteUrl]
    },
    twitter: {
      card: 'summary',
      title: post.title,
      description: post.description
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
            <h1 className='mt-4 text-4xl font-bold tracking-tight sm:text-5xl lg:text-7xl'>
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
          description={recommendation.description}
          href={articleHref(recommendation.slug)}
          label='Continue exploring'
          readLabel='Read next'
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
