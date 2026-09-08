import type { Metadata } from 'next';

import App from '../App';
import { getAllPosts } from '../lib/blog';

export const metadata: Metadata = {
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
