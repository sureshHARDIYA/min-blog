import type { MetadataRoute } from 'next';

import { getAllPosts } from '../lib/blog';
import { BOOK_ROUTE_SLUGS } from '../types';

const siteUrl = 'https://www.skmukhiya.com.np';

const staticRoutes: MetadataRoute.Sitemap = [
  { url: siteUrl, changeFrequency: 'monthly', priority: 1 },
  { url: `${siteUrl}/trajectory`, changeFrequency: 'yearly', priority: 0.7 },
  { url: `${siteUrl}/research`, changeFrequency: 'monthly', priority: 0.8 },
  ...Object.values(BOOK_ROUTE_SLUGS).map((slug) => ({
    url: `${siteUrl}/research/book/${slug}`,
    changeFrequency: 'yearly' as const,
    priority: 0.6,
  })),
  { url: `${siteUrl}/stack`, changeFrequency: 'monthly', priority: 0.7 },
  { url: `${siteUrl}/security`, changeFrequency: 'monthly', priority: 0.9 },
  { url: `${siteUrl}/connect`, changeFrequency: 'yearly', priority: 0.6 },
  { url: `${siteUrl}/blogs`, changeFrequency: 'weekly', priority: 0.9 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getAllPosts();

  return [
    ...staticRoutes,
    ...posts.map((post) => ({
      url: `${siteUrl}/blog/${post.slug}`,
      lastModified: post.date,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
  ];
}
