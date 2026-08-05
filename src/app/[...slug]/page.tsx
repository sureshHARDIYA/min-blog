import type { Metadata } from 'next';

import App from '../../App';
import { getNavTabFromPath } from '../../types';

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
  return <App initialTab={getNavTabFromPath(`/${slug[0] || ''}`)} />;
}
