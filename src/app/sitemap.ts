import type { MetadataRoute } from 'next';
import { BOOK_ROUTE_SLUGS } from '../types';

const siteUrl = 'https://skmukhiya.com.np';

const routes = [
  '/',
  '/trajectory',
  '/research',
  ...Object.values(BOOK_ROUTE_SLUGS).map((slug) => `/research/book/${slug}`),
  '/stack',
  '/connect',
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return routes.map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified,
    changeFrequency: route === '/' ? 'monthly' : 'yearly',
    priority: route === '/' ? 1 : 0.8,
  }));
}
