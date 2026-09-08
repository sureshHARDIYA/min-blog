import 'server-only';

import { promises as fs } from 'node:fs';
import path from 'node:path';

const BLOG_DIRECTORY = path.join(process.cwd(), 'src', 'content', 'blog');
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const FRONTMATTER_BOUNDARY = '---\n';

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  date: string;
  content: string;
}

const removeMatchingQuotes = (value: string) => {
  const first = value.at(0);
  const last = value.at(-1);

  if (value.length >= 2 && first === last && (first === '"' || first === "'")) {
    return value.slice(1, -1);
  }

  return value;
};

const parseFrontmatter = (source: string) => {
  if (!source.startsWith(FRONTMATTER_BOUNDARY)) {
    throw new Error('Blog post is missing YAML-style frontmatter.');
  }

  const metadataStart = FRONTMATTER_BOUNDARY.length;
  const metadataEnd = source.indexOf(`\n${FRONTMATTER_BOUNDARY}`, metadataStart);

  if (metadataEnd === -1) {
    throw new Error('Blog post is missing a closing frontmatter boundary.');
  }

  const metadata: Record<string, string> = {};

  for (const line of source.slice(metadataStart, metadataEnd).split('\n')) {
    const separator = line.indexOf(':');

    if (separator <= 0) {
      continue;
    }

    const key = line.slice(0, separator).trim();
    const value = line.slice(separator + 1).trim();

    if (key) {
      metadata[key] = removeMatchingQuotes(value);
    }
  }

  return {
    metadata,
    content: source.slice(metadataEnd + FRONTMATTER_BOUNDARY.length + 1).trim(),
  };
};

export async function getPost(slug: string): Promise<BlogPost | null> {
  if (!SLUG_PATTERN.test(slug)) {
    return null;
  }

  try {
    const source = await fs.readFile(path.join(BLOG_DIRECTORY, `${slug}.md`), 'utf8');
    const { metadata, content } = parseFrontmatter(source);

    if (!metadata.title || !metadata.description || !metadata.date) {
      throw new Error(`Blog post "${slug}" is missing title, description, or date.`);
    }

    return {
      slug,
      title: metadata.title,
      description: metadata.description,
      date: metadata.date,
      content,
    };
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return null;
    }

    throw error;
  }
}

export async function getAllPosts(): Promise<BlogPost[]> {
  const files = await fs.readdir(BLOG_DIRECTORY);
  const posts = await Promise.all(
    files
      .filter((file) => file.endsWith('.md'))
      .map((file) => getPost(file.slice(0, -3))),
  );

  return posts
    .filter((post): post is BlogPost => Boolean(post))
    .sort((a, b) => b.date.localeCompare(a.date));
}
