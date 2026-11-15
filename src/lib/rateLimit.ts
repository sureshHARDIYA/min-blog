interface Bucket {
  count: number
  resetAt: number
}

const MAX_TRACKED_KEYS = 5000

/**
 * Best-effort fixed-window limiter held in memory.
 * Serverless instances do not share memory, so this slows a single abusive client
 * but is not a hard guarantee: pair it with a platform firewall rate-limit rule.
 */
export function createRateLimiter(limit: number, windowMs: number) {
  const buckets = new Map<string, Bucket>()

  return function isAllowed(key: string, now: number = Date.now()): boolean {
    const bucket = buckets.get(key)
    if (!bucket || bucket.resetAt <= now) {
      if (buckets.size >= MAX_TRACKED_KEYS) {
        for (const [storedKey, stored] of buckets) {
          if (stored.resetAt <= now) buckets.delete(storedKey)
        }
        if (buckets.size >= MAX_TRACKED_KEYS) buckets.clear()
      }
      buckets.set(key, { count: 1, resetAt: now + windowMs })
      return true
    }
    if (bucket.count >= limit) return false
    buckets.set(key, { ...bucket, count: bucket.count + 1 })
    return true
  }
}
