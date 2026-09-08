import 'server-only';

import { promises as fs } from 'node:fs';
import path from 'node:path';

const BLOG_DIRECTORY = path.join(process.cwd(), 'src', 'content', 'blog');
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  date: string;
  content: string;
}

const parseFrontmatter = (source: string) => {
  const match = source.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);

  if (!match) {
    throw new Error('Blog post is missing YAML-style frontmatter.');
  }

  const metadata = Object.fromEntries(
    match[1]
      .split('\n')
      .map((line) => line.match(/^([a-zA-Z][\w-]*):\s*(.*)$/))
      .filter((entry): entry is RegExpMatchArray => Boolean(entry))
      .map((entry) => [
        entry[1],
        entry[2].trim().replace(/^(['"])(.*)\1$/, '$2'),
      ]),
  );

  return { metadata, content: match[2].trim() };
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
