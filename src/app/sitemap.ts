import type { MetadataRoute } from 'next';

import { getAllPosts } from '../lib/blog';
import { BOOK_ROUTE_SLUGS } from '../types';

const siteUrl = 'https://skmukhiya.com.np';

const staticRoutes = [
  '/',
  '/trajectory',
  '/research',
  ...Object.values(BOOK_ROUTE_SLUGS).map((slug) => `/research/book/${slug}`),
  '/stack',
  '/connect',
  '/blogs',
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getAllPosts();
  const routes = [
    ...staticRoutes,
    ...posts.map((post) => `/blog/${post.slug}`),
  ];
  const lastModified = new Date();

  return routes.map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified,
    changeFrequency: route === '/' ? 'monthly' : 'yearly',
    priority: route === '/' ? 1 : 0.8,
  }));
}
