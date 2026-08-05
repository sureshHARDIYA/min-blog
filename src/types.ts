export type NavTab = 'architecture' | 'trajectory' | 'research' | 'stack' | 'connect';

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
}

export interface ContactResponse {
  success: boolean;
  referenceId: string;
  message: string;
  timestamp: string;
}
