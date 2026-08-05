export type NavTab = 'architecture' | 'trajectory' | 'research' | 'stack' | 'connect';

export const NAV_TAB_PATHS: Record<NavTab, string> = {
  architecture: '/',
  trajectory: '/trajectory',
  research: '/research',
  stack: '/stack',
  connect: '/connect',
};

export const getNavTabFromPath = (pathname: string): NavTab => {
  const path = pathname.replace(/\/$/, '') || '/';
  const match = Object.entries(NAV_TAB_PATHS).find(([, tabPath]) => {
    if (tabPath === '/') {
      return path === '/';
    }

    return path === tabPath || path.startsWith(`${tabPath}/`);
  });
  return (match?.[0] as NavTab) || 'architecture';
};

export const BOOK_ROUTE_SLUGS: Record<string, string> = {
  'book-1': 'statistics-for-data-scientists-and-analysts',
  'book-2': 'hands-on-exploratory-data-analysis',
  'book-3': 'redux-quick-start-guide',
  'book-4': 'hands-on-big-data-modeling',
};

export const getBookSlug = (bookId: string): string => BOOK_ROUTE_SLUGS[bookId] || bookId;

export const getBookIdFromSlug = (slug: string): string => {
  const match = Object.entries(BOOK_ROUTE_SLUGS).find(([, bookSlug]) => bookSlug === slug);
  return match?.[0] || slug;
};

export interface TrajectoryItem {
  id: string;
  company: string;
  period: string;
  role: string;
  description: string;
  tags: string[];
}

export interface PublishedBook {
  id: string;
  publisher: string;
  title: string;
  year: number;
  isbn?: string;
  pages?: number;
  summary: string;
  topics: string[];
  url?: string;
}

export interface ResearchPaper {
  id: string;
  title: string;
  journal: string;
  year: number;
  authors: string[];
  doi?: string;
  abstract: string;
  citations?: number;
  url?: string;
  topics: string[];
}

export interface Philosophy {
  id: string;
  number: string;
  title: string;
  summary: string;
  details: string[];
}

export interface TechCategory {
  category: string;
  description: string;
  skills: { name: string; proficiency: string; level: number; note: string }[];
}

export interface ContactFormData {
  name: string;
  email: string;
  company?: string;
  scope: string;
  message: string;
  recaptchaToken?: string;
}

export interface ContactResponse {
  success: boolean;
  referenceId: string;
  message: string;
  timestamp: string;
}
