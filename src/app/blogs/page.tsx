import type { Metadata } from 'next';
import Link from 'next/link';

import { getAllPosts } from '../../lib/blog';

export const metadata: Metadata = {
  title: 'Blog',
  description:
    'Field notes on application security, software architecture, supply-chain risk and engineering leadership.',
  alternates: {
    canonical: '/blogs',
  },
};

export default async function BlogsPage() {
  const posts = await getAllPosts();

  return (
    <main className="min-h-screen bg-[#0C0C0C] px-6 py-20 text-[#F5F5F5]">
      <section className="mx-auto max-w-3xl">
        <Link className="text-sm text-cyan-400 hover:underline" href="/">
          ← Suresh Kumar Mukhiya
        </Link>
        <h1 className="mt-10 text-5xl font-bold tracking-tight">Field notes</h1>
        <p className="mt-4 text-lg text-white/65">
          What I am learning from architecture decisions, security reviews and the less tidy
          parts of building software.
        </p>

        <div className="mt-12 divide-y divide-white/10">
          {posts.map((post) => (
            <article className="py-8 first:pt-0" key={post.slug}>
              <time className="text-sm text-cyan-400" dateTime={post.date}>
                {post.date}
              </time>
              <h2 className="mt-2 text-2xl font-semibold">
                <Link className="hover:text-cyan-300" href={`/blog/${post.slug}`}>
                  {post.title}
                </Link>
              </h2>
              <p className="mt-3 text-white/65">{post.description}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
