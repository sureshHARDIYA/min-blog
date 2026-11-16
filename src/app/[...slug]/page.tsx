import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import App from '../../App';
import { getAllPosts } from '../../lib/blog';
import { getNavTabFromPath, isKnownAppPath } from '../../types';

const routeMeta: Record<string, { title: string; description: string }> = {
  trajectory: {
    title: 'Trajectory | Suresh Kumar Mukhiya, PhD',
    description: 'Career timeline and engineering leadership trajectory for Suresh Kumar Mukhiya, PhD.',
  },
  research: {
    title: 'Research & PhD Thesis | Suresh Kumar Mukhiya, PhD',
    description: 'Research publications, books, and PhD thesis by Suresh Kumar Mukhiya on adaptive systems, interoperability, health informatics, and software engineering.',
  },
  stack: {
    title: 'Technology Stack | Suresh Kumar Mukhiya, PhD',
    description: 'Production technology stack across frontend, backend, cloud, security, AI, data systems, and software architecture.',
  },
  connect: {
    title: 'Contact | Suresh Kumar Mukhiya, PhD',
    description: 'Contact Suresh Kumar Mukhiya for architecture, cybersecurity, AI engineering, and technical leadership collaboration.',
  },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug?: string[] }>;
}): Promise<Metadata> {
  const { slug = [] } = await params;
  const route = slug[0] || '';
  const meta = routeMeta[route];
  const canonical = meta ? `/${slug.join('/')}` : '/';

  return {
    title: meta?.title,
    description: meta?.description,
    alternates: {
      canonical,
    },
  };
}

export default async function CatchAllPage({
  params,
}: {
  params: Promise<{ slug?: string[] }>;
}) {
  const { slug = [] } = await params;
  if (!isKnownAppPath(slug)) {
    notFound();
  }

  // The home tab can be opened client-side from any of these pages, so it needs its data too.
  const posts = await getAllPosts();
  const latestPosts = posts.slice(0, 6).map(({ content: _content, ...post }) => post);

  return (
    <App
      initialTab={getNavTabFromPath(`/${slug[0] || ''}`)}
      latestPosts={latestPosts}
    />
  );
}
