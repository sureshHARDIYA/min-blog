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

/** One MP3 holding the whole narrated article, used by the podcast feed. */
export interface ArticleEpisode {
  url: string
  bytes: number
  duration: number
}

export interface ArticleAudio {
  segments: ListenSegment[]
  episode: ArticleEpisode | null
}

const NO_AUDIO: ArticleAudio = { segments: [], episode: null }

function toEpisode(value: unknown, baseUrl: string): ArticleEpisode | null {
  if (typeof value !== 'object' || value === null) return null
  const { url, bytes, duration } = value as Record<string, unknown>
  const isValid =
    typeof url === 'string' &&
    url.startsWith(`${baseUrl}/`) &&
    typeof bytes === 'number' &&
    bytes > 0 &&
    typeof duration === 'number' &&
    duration > 0
  return isValid ? { url, bytes, duration } : null
}

/** Narration segments for an article, or an empty list when audio is absent or stale. */
export async function getArticleAudio(
  slug: string,
  content: string
): Promise<ListenSegment[]> {
  return (await getArticleAudioDetails(slug, content)).segments
}

/**
 * Narration for an article. A missing manifest is normal (audio pending). A corrupt one
 * is logged, never thrown, so the visual article always renders.
 */
export async function getArticleAudioDetails(
  slug: string,
  content: string
): Promise<ArticleAudio> {
  try {
    const raw = await readOptional(
      path.join(CONTENT_DIR, 'audio', `${slug}.json`)
    )
    if (raw === null) return NO_AUDIO
    const data: unknown = JSON.parse(raw)
    if (typeof data !== 'object' || data === null)
      throw new Error('manifest is not an object')
    const { contentHash, publicBaseUrl, segments, episode } = data as Record<
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
    if (contentHash !== hash) return NO_AUDIO
    if (
      typeof publicBaseUrl !== 'string' ||
      !publicBaseUrl.startsWith('https://') ||
      !Array.isArray(segments)
    )
      throw new Error('manifest is missing publicBaseUrl or segments')
    const valid = segments.map((segment) => toSegment(segment, publicBaseUrl))
    if (valid.includes(null))
      throw new Error('manifest contains an invalid segment')
    return {
      segments: valid as ListenSegment[],
      episode: toEpisode(episode, publicBaseUrl)
    }
  } catch (error: unknown) {
    console.error(
      `[article-audio] Ignoring narration manifest for "${slug}":`,
      error
    )
    return NO_AUDIO
  }
}
