import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import ReactMarkdown from 'react-markdown';

import { BlogCode, BlogList, BlogListItem } from '../../../components/BlogCode';
import { getAllPosts, getPost } from '../../../lib/blog';

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const posts = await getAllPosts();
  return posts.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return {};

  return {
    title: `${post.title} | Suresh Kumar Mukhiya`,
    description: post.description,
    alternates: { canonical: `/blog/${post.slug}` },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  return (
    <main className="min-h-screen bg-[#0C0C0C] px-5 py-16 text-[#F5F5F5] sm:px-8 lg:px-12 lg:py-20">
      <article className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-5xl">
          <Link className="text-sm text-cyan-400 hover:underline" href="/blogs">
            ← All posts
          </Link>

          <header className="mt-10 border-b border-white/10 pb-10">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-400">
              Architecture &amp; AppSec
            </p>
            <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl lg:text-7xl">
              {post.title}
            </h1>
            <time className="mt-5 block text-lg text-white/65" dateTime={post.date}>
              {new Intl.DateTimeFormat('en-GB', {
                dateStyle: 'long',
                timeZone: 'UTC',
              }).format(new Date(`${post.date}T00:00:00Z`))}
            </time>
          </header>
        </div>

        <div className="blog-prose mt-12 text-lg leading-8 text-white/80">
          <ReactMarkdown
            components={{
              h2: ({ children }) => <h2>{children}</h2>,
              h3: ({ children }) => <h3>{children}</h3>,
              p: ({ children }) => <p>{children}</p>,
              ol: ({ children }) => <ol>{children}</ol>,
              ul: BlogList,
              li: BlogListItem,
              pre: ({ children }) => <>{children}</>,
              code: BlogCode,
              a: ({ children, href }) => (
                <a href={href} rel="noreferrer" target={href?.startsWith('http') ? '_blank' : undefined}>
                  {children}
                </a>
              ),
              blockquote: ({ children }) => <blockquote>{children}</blockquote>,
            }}
          >
            {post.content}
          </ReactMarkdown>
        </div>
      </article>
    </main>
  );
}
