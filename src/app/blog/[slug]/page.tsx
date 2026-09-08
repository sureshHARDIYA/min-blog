import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import ReactMarkdown from 'react-markdown';

import { getAllPosts, getPost } from '../../../lib/blog';

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const posts = await getAllPosts();
  return posts.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) {
    return {};
  }

  return {
    title: `${post.title} | Suresh Kumar Mukhiya`,
    description: post.description,
    alternates: {
      canonical: `/blog/${post.slug}`,
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[#0C0C0C] px-6 py-20 text-[#F5F5F5]">
      <article className="mx-auto max-w-3xl">
        <Link className="text-sm text-cyan-400 hover:underline" href="/blogs">
          ← All posts
        </Link>

        <header className="mt-10 border-b border-white/10 pb-10">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-400">
            AppSec Brief
          </p>
          <h1 className="mt-4 text-4xl font-bold tracking-tight md:text-6xl">
            {post.title}
          </h1>
          <time className="mt-5 block text-lg text-white/65" dateTime={post.date}>
            {new Intl.DateTimeFormat('en-GB', {
              dateStyle: 'long',
              timeZone: 'UTC',
            }).format(new Date(`${post.date}T00:00:00Z`))}
          </time>
        </header>

        <div className="mt-12 text-lg leading-8 text-white/80">
          <ReactMarkdown
            components={{
              h2: ({ children }) => (
                <h2 className="mb-4 mt-10 text-2xl font-semibold text-white">
                  {children}
                </h2>
              ),
              h3: ({ children }) => (
                <h3 className="mb-3 mt-8 text-xl font-semibold text-white">
                  {children}
                </h3>
              ),
              p: ({ children }) => <p className="my-4">{children}</p>,
              ol: ({ children }) => (
                <ol className="my-4 list-decimal space-y-3 pl-6">{children}</ol>
              ),
              ul: ({ children }) => (
                <ul className="my-4 list-disc space-y-2 pl-6">{children}</ul>
              ),
              a: ({ children, href }) => (
                <a
                  className="text-cyan-400 hover:underline"
                  href={href}
                  rel="noreferrer"
                  target={href?.startsWith('http') ? '_blank' : undefined}
                >
                  {children}
                </a>
              ),
              code: ({ children }) => (
                <code className="rounded bg-white/10 px-1.5 py-0.5 text-sm text-cyan-200">
                  {children}
                </code>
              ),
              blockquote: ({ children }) => (
                <blockquote className="my-6 border-l-2 border-cyan-400 pl-5 text-white/65">
                  {children}
                </blockquote>
              ),
            }}
          >
            {post.content}
          </ReactMarkdown>
        </div>
      </article>
    </main>
  );
}
