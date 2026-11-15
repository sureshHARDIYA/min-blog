import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import ReactMarkdown, { type Components } from 'react-markdown'

import { BlogPostMetadata } from '../../../components/BlogPostMetadata'
import { BlogCode, BlogList, BlogListItem } from '../../../components/BlogCode'
import { AppSecSubscribeForm } from '../../../components/AppSecSubscribeForm'
import { ArticleRecommendation } from '../../../components/ArticleRecommendation'
import { AgentBaitingChart } from '../../../components/AgentBaitingChart'
import { getAllPosts, getPost } from '../../../lib/blog'
import { getArticleAudio } from '../../../lib/articleAudio'
import { ArticleListen } from '../../../components/ArticleListen'

interface BlogPostPageProps {
  params: Promise<{ slug: string }>
}

const siteUrl = 'https://www.skmukhiya.com.np'

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


/** Render pipe tables without a new dependency; preserve Markdown outside tables. */
function renderArticleMarkdown(source: string) {
  const lines = source.split('\n')
  const blocks: Array<{ kind: 'markdown' | 'table'; lines: string[] }> = []
  let current: string[] = []
  let inFence = false
  const flush = () => {
    if (current.length) blocks.push({ kind: 'markdown', lines: current })
    current = []
  }
  const isSeparator = (line: string) => /^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?\s*$/.test(line)
  const cells = (line: string) => line.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map((cell) => cell.trim())
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    if (line.trimStart().startsWith('```')) inFence = !inFence
    if (!inFence && line.includes('|') && i + 1 < lines.length && isSeparator(lines[i + 1])) {
      flush()
      const table = [line, lines[++i]]
      while (i + 1 < lines.length && lines[i + 1].includes('|') && lines[i + 1].trim()) table.push(lines[++i])
      blocks.push({ kind: 'table', lines: table })
    } else current.push(line)
  }
  flush()
  return blocks.map((block, index) => {
    if (block.kind === 'markdown') return <ReactMarkdown components={MARKDOWN_COMPONENTS} key={index}>{block.lines.join('\n')}</ReactMarkdown>
    const headers = cells(block.lines[0])
    return (
      <div className='agentbaiting-table-scroll' key={index} role='region' aria-label={`Evidence table ${index + 1}`} tabIndex={0}>
        <table className='agentbaiting-data-table'>
          <thead><tr>{headers.map((header, cellIndex) => <th scope='col' key={cellIndex}><ReactMarkdown components={MARKDOWN_COMPONENTS}>{header}</ReactMarkdown></th>)}</tr></thead>
          <tbody>{block.lines.slice(2).map((row, rowIndex) => <tr key={rowIndex}>{headers.map((_, cellIndex) => <td key={cellIndex}><ReactMarkdown components={MARKDOWN_COMPONENTS}>{cells(row)[cellIndex] ?? ''}</ReactMarkdown></td>)}</tr>)}</tbody>
        </table>
      </div>
    )
  })
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
  const audioSegments = await getArticleAudio(post.slug, post.content)
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
    <main className='blog-article-page blog-theme-page min-h-screen bg-[#111111] pt-16 text-[#F5F5F5] md:pt-20'>
      <script
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(articleJsonLd) }}
        type='application/ld+json'
      />
      <article className='mx-auto max-w-[55.2rem] px-6 pb-16 pt-9 sm:px-8 sm:pt-12'>
        <Link
          className='inline-flex items-center gap-2 text-sm font-medium text-[var(--article-muted)] transition-colors hover:text-[var(--article-accent)] hover:underline'
          href='/blogs'
        >
          <span aria-hidden='true'>←</span> All posts
        </Link>

        <header className='article-intro mt-8 border-b border-[var(--article-border)] pb-7'>
          <BlogPostMetadata date={post.date} category={post.category} />
          <h1 className='article-title mt-4 wrap-break-word'>
            {post.title}
          </h1>
          <p className='mt-4 text-base leading-relaxed text-[var(--article-muted)] sm:text-lg'>
            {post.description}
          </p>
        </header>

        <ArticleListen segments={audioSegments} />
        <div className='blog-prose mt-7 wrap-break-word text-white/80 sm:mt-9'>
          {markdownSections(post.content).map((section, sectionIndex) => {
            const title = sectionTitle(section)
            return (
              post.slug === 'agentbaiting-malicious-ai-tools-enterprise-security-2026' &&
              new Set(['Technical evidence appendix', 'Limitations and methodology', 'References', 'Detection engineering: actionable hypotheses', 'Enterprise threat model']).has(title) ? (
                <details className='agentbaiting-accordion' key={title}>
                  <summary>{title}<span aria-hidden='true'>＋</span></summary>
                  <div className='agentbaiting-accordion-body'>
                    {renderArticleMarkdown(section.slice(section.indexOf('\n') + 1))}
                  </div>
                </details>
              ) : (
                <section
                  id={`listen-section-${sectionIndex}`}
                  className={
                    title === 'Build it safely with AI'
                      ? 'blog-ai-playbook'
                      : TWO_COLUMN_SECTIONS.has(title)
                        ? 'blog-two-column-section'
                        : undefined
                  }
                  key={title || 'introduction'}
                >
                  {post.slug === 'agentbaiting-malicious-ai-tools-enterprise-security-2026' ? renderArticleMarkdown(section) : <ReactMarkdown components={MARKDOWN_COMPONENTS}>{section}</ReactMarkdown>}
                  {post.slug === 'agentbaiting-malicious-ai-tools-enterprise-security-2026' && title === 'Evidence dashboard' ? <AgentBaitingChart /> : null}
                </section>
              )
            )
          })}
        </div>
        {post.slug.startsWith('appsec-') ? (
          <aside
            aria-labelledby='appsec-subscribe-title'
            className='article-panel mt-16 p-6 sm:p-8'
          >
            <p className='article-accent font-code text-xs font-semibold uppercase tracking-[0.2em]'>
              Weekly engineering signal
            </p>
            <h2
              className='font-headline-md mt-3'
              id='appsec-subscribe-title'
            >
              Get the Monday AppSec Brief
            </h2>
            <p className='mt-3 max-w-3xl text-base leading-7 text-white/70 sm:text-lg'>
              Consequential application-security and software supply-chain
              developments for developers, Tech Leads and architects—delivered
              weekly.
            </p>
            <AppSecSubscribeForm />
            <p className='mt-4 text-sm text-white/50'>
              You will receive only the Monday AppSec Brief—no promotions or
              unrelated emails. Subscription confirmation is handled by Brevo,
              and you can unsubscribe at any time.
            </p>
          </aside>
        ) : null}
        <nav
          aria-label='Article navigation'
          className='mt-12 grid gap-4 border-t border-white/10 pt-8 sm:grid-cols-2'
        >
          <div>
            {olderPost ? (
              <Link
                className='article-panel article-nav-link block h-full p-5 transition-colors'
                href={articleHref(olderPost.slug)}
              >
                <span className='article-accent font-code text-[10px] font-bold uppercase tracking-widest'>
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
                className='article-panel article-nav-link block h-full p-5 transition-colors sm:text-right'
                href={articleHref(newerPost.slug)}
              >
                <span className='article-accent font-code text-[10px] font-bold uppercase tracking-widest'>
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
