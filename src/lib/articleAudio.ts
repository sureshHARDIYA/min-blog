import 'server-only'
import { createHash } from 'node:crypto'
import { promises as fs } from 'node:fs'
import path from 'node:path'

import type { ListenSegment } from '../components/ArticleListen'

const CONTENT_DIR = path.join(process.cwd(), 'src', 'content')

function isMissingFile(error: unknown): boolean {
  return error instanceof Error && 'code' in error && error.code === 'ENOENT'
}

async function readOptional(file: string): Promise<string | null> {
  try {
    return await fs.readFile(file, 'utf8')
  } catch (error: unknown) {
    if (isMissingFile(error)) return null
    throw error
  }
}

/** Accept only well-formed segments that live under the manifest's own base URL. */
function toSegment(value: unknown, baseUrl: string): ListenSegment | null {
  if (typeof value !== 'object' || value === null) return null
  const { id, text, url, duration } = value as Record<string, unknown>
  if (
    typeof id !== 'string' ||
    typeof text !== 'string' ||
    typeof url !== 'string'
  )
    return null
  if (!/^listen-section-\d+$/.test(id) || !url.startsWith(`${baseUrl}/`))
    return null
  const hasDuration =
    typeof duration === 'number' && Number.isFinite(duration) && duration > 0
  return hasDuration ? { id, text, url, duration } : { id, text, url }
}

/**
 * Narration segments for an article, or an empty list when audio is absent or stale.
 * A missing manifest is normal (audio pending). A corrupt one is logged, never thrown,
 * so the visual article always renders.
 */
export async function getArticleAudio(
  slug: string,
  content: string
): Promise<ListenSegment[]> {
  try {
    const raw = await readOptional(
      path.join(CONTENT_DIR, 'audio', `${slug}.json`)
    )
    if (raw === null) return []
    const data: unknown = JSON.parse(raw)
    if (typeof data !== 'object' || data === null)
      throw new Error('manifest is not an object')
    const { contentHash, publicBaseUrl, segments } = data as Record<
      string,
      unknown
    >
    const overrides =
      (await readOptional(
        path.join(CONTENT_DIR, 'narration', `${slug}.json`)
      )) ?? ''
    const hash = createHash('sha256')
      .update(content)
      .update(String.raw`\nNARRATION\n`)
      .update(overrides)
      .digest('hex')
    if (contentHash !== hash) return []
    if (
      typeof publicBaseUrl !== 'string' ||
      !publicBaseUrl.startsWith('https://') ||
      !Array.isArray(segments)
    )
      throw new Error('manifest is missing publicBaseUrl or segments')
    const valid = segments.map((segment) => toSegment(segment, publicBaseUrl))
    if (valid.includes(null))
      throw new Error('manifest contains an invalid segment')
    return valid as ListenSegment[]
  } catch (error: unknown) {
    console.error(
      `[article-audio] Ignoring narration manifest for "${slug}":`,
      error
    )
    return []
  }
}
