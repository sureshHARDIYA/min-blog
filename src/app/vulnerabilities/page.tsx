import type { Metadata } from 'next'
import { VulnerabilityList } from './VulnerabilityList'

export const metadata: Metadata = {
  title: 'Vulnerability Intelligence',
  description: 'Recent public security advisories from VulnIntel, enriched with CISA known-exploited status.',
  alternates: { canonical: '/vulnerabilities' }
}

export const revalidate = 3600

type Advisory = { id: string; aliases: string[]; summary: string; severity: string; published: string | null; known_exploited: boolean; source: string; url: string }
type Snapshot = { schema_version: number; generated_at: string; count: number; advisories: Advisory[] }

async function getFeed(): Promise<Snapshot | null> {
  try {
    const response = await fetch('https://raw.githubusercontent.com/sureshHARDIYA/vulnintel/public-feed/public-feed/vulnerabilities.json', { next: { revalidate: 3600 } })
    if (!response.ok) return null
    const data: unknown = await response.json()
    if (!data || typeof data !== 'object') return null
    const feed = data as Snapshot
    if (feed.schema_version !== 1 || !Array.isArray(feed.advisories) || typeof feed.generated_at !== 'string') return null
    return feed
  } catch { return null }
}

export default async function VulnerabilitiesPage() {
  const feed = await getFeed()
  return <VulnerabilityList feed={feed} />
}
