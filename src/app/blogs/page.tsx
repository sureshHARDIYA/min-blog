import type { Metadata } from 'next';
import { getAllPosts } from '../../lib/blog';
import { BlogsContent } from './BlogsContent';

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
  return <BlogsContent posts={posts.map(({ content: _content, ...post }) => post)} />;
}
