import 'server-only'
import { promises as fs } from 'node:fs'
import path from 'node:path'
import type { ListenSegment } from '../components/ArticleListen'

export async function getArticleAudio(slug: string, content: string): Promise<ListenSegment[]> {
  try {
    const data = JSON.parse(await fs.readFile(path.join(process.cwd(), 'src', 'content', 'audio', slug + '.json'), 'utf8'))
    const { createHash } = await import('node:crypto')
    const hash = createHash('sha256').update(content).digest('hex')
    return data.contentHash === hash && Array.isArray(data.segments) ? data.segments : []
  } catch { return [] }
}
