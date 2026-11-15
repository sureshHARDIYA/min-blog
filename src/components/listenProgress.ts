/** Remembers where a reader stopped listening, per article, in this browser only. */
export interface ListenProgress {
  index: number
  seconds: number
}

const KEY_PREFIX = 'article-listen-progress:'
const MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000
/** Positions this close to the start are not worth restoring. */
const MIN_RESUME_SECONDS = 3

function storageKey(): string {
  return KEY_PREFIX + globalThis.location.pathname
}

export function readListenProgress(trackCount: number): ListenProgress | null {
  try {
    const raw = localStorage.getItem(storageKey())
    if (!raw) return null
    const saved: unknown = JSON.parse(raw)
    if (typeof saved !== 'object' || saved === null) return null
    const { index, seconds, savedAt } = saved as Record<string, unknown>
    const isValid =
      typeof index === 'number' &&
      Number.isInteger(index) &&
      index >= 0 &&
      index < trackCount &&
      typeof seconds === 'number' &&
      Number.isFinite(seconds) &&
      typeof savedAt === 'number' &&
      Date.now() - savedAt < MAX_AGE_MS
    if (!isValid) return null
    const isWorthResuming = index > 0 || seconds >= MIN_RESUME_SECONDS
    return isWorthResuming ? { index, seconds } : null
  } catch {
    return null // storage blocked or corrupt: start from the beginning
  }
}

export function saveListenProgress(progress: ListenProgress): void {
  try {
    localStorage.setItem(
      storageKey(),
      JSON.stringify({ ...progress, savedAt: Date.now() })
    )
  } catch {
    // storage blocked: resuming is a convenience, playback is unaffected
  }
}

export function clearListenProgress(): void {
  try {
    localStorage.removeItem(storageKey())
  } catch {
    // storage blocked: nothing was saved
  }
}
