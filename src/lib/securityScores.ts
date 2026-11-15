import 'server-only'
import { unstable_cache } from 'next/cache'

const SITE_HOST = 'www.skmukhiya.com.np'
const SONAR_PROJECT = 'sureshHARDIYA_min-blog'
const REQUEST_TIMEOUT_MS = 8000
const REFRESH_SECONDS = 60 * 60
const SONAR_RATINGS = ['A', 'B', 'C', 'D', 'E']

export interface ObservatoryScore {
  grade: string
  testsPassed: number
  testsTotal: number
}

export interface SonarScore {
  hasPassedQualityGate: boolean
  securityRating: string
  vulnerabilities: number
}

export interface SecurityScores {
  observatory: ObservatoryScore | null
  sonar: SonarScore | null
}

async function fetchJson(
  url: string,
  method: 'GET' | 'POST'
): Promise<unknown> {
  const response = await fetch(url, {
    method,
    cache: 'no-store',
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS)
  })
  if (!response.ok) throw new Error(`${url} responded ${response.status}`)
  return response.json()
}

async function fetchObservatory(): Promise<ObservatoryScore> {
  const data = (await fetchJson(
    `https://observatory-api.mdn.mozilla.net/api/v2/scan?host=${SITE_HOST}`,
    'POST'
  )) as Record<string, unknown>
  const { grade, tests_passed: testsPassed, tests_quantity: testsTotal } = data
  const isValid =
    typeof grade === 'string' &&
    /^[A-F][+-]?$/.test(grade) &&
    typeof testsPassed === 'number' &&
    typeof testsTotal === 'number'
  if (!isValid) throw new Error('Unexpected Observatory response')
  return { grade, testsPassed, testsTotal }
}

async function fetchSonar(): Promise<SonarScore> {
  const data = (await fetchJson(
    `https://sonarcloud.io/api/measures/component?component=${SONAR_PROJECT}&metricKeys=alert_status,security_rating,vulnerabilities`,
    'GET'
  )) as { component?: { measures?: { metric?: string; value?: string }[] } }
  const measures = new Map(
    (data.component?.measures ?? []).map(({ metric, value }) => [metric, value])
  )
  const securityRating =
    SONAR_RATINGS[Number(measures.get('security_rating')) - 1]
  const vulnerabilities = Number(measures.get('vulnerabilities'))
  const gate = measures.get('alert_status')
  if (!securityRating || !Number.isInteger(vulnerabilities) || !gate) {
    throw new Error('Unexpected SonarCloud response')
  }
  return {
    hasPassedQualityGate: gate === 'OK',
    securityRating,
    vulnerabilities
  }
}

// Failures throw so they are never cached; a successful result is reused for an hour.
const cachedObservatory = unstable_cache(
  fetchObservatory,
  ['security-observatory'],
  {
    revalidate: REFRESH_SECONDS
  }
)
const cachedSonar = unstable_cache(fetchSonar, ['security-sonar'], {
  revalidate: REFRESH_SECONDS
})

async function orNull<T>(
  load: () => Promise<T>,
  label: string
): Promise<T | null> {
  try {
    return await load()
  } catch (error: unknown) {
    console.error(`[security-scores] ${label} unavailable:`, error)
    return null
  }
}

/** Independent scanner results for this site. A scanner that cannot be reached yields null. */
export async function getSecurityScores(): Promise<SecurityScores> {
  const [observatory, sonar] = await Promise.all([
    orNull(cachedObservatory, 'Observatory'),
    orNull(cachedSonar, 'SonarCloud')
  ])
  return { observatory, sonar }
}
