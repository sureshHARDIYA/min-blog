import type { Metadata } from 'next';

import App from '../App';
import { getAllPosts } from '../lib/blog';

export const metadata: Metadata = {
  title: {
    absolute: 'Suresh Kumar Mukhiya, PhD | AppSec & Architecture',
  },
  description:
    'Cybersecurity and software architecture field notes from Suresh Kumar Mukhiya, a Tech Lead in Bergen working with secure APIs, cloud systems and AI.',
  alternates: {
    canonical: '/',
  },
};

export default async function Page() {
  const [latestPost] = await getAllPosts();

  return (
    <App
      latestPost={
        latestPost
          ? {
              slug: latestPost.slug,
              title: latestPost.title,
              date: latestPost.date,
            }
          : undefined
      }
    />
  );
}
