import type { SecurityScores } from '../../lib/securityScores'
import copy from './copy.json'

type ScorecardText = (typeof copy)['en']['scorecard']

interface Tile {
  title: string
  source: string
  /** Null when the scanner could not be reached: the tile then only links to the report. */
  value: string | null
  detail: string
  href: string
  isGood: boolean
}

const SITE_HOST = 'www.skmukhiya.com.np'
const SONAR_PROJECT = 'sureshHARDIYA_min-blog'
const OBSERVATORY_REPORT = `https://developer.mozilla.org/en-US/observatory/analyze?host=${SITE_HOST}`
const SONAR_REPORT = `https://sonarcloud.io/summary/overall?id=${SONAR_PROJECT}`
const DISCLOSURE_POLICY = '/.well-known/security.txt'

function codeDetail(scores: SecurityScores, text: ScorecardText): string {
  if (!scores.sonar) return ''
  const count = scores.sonar.vulnerabilities
  return count === 1
    ? text.codeDetailOne
    : text.codeDetail.replace('{count}', String(count))
}

function buildTiles(scores: SecurityScores, text: ScorecardText): Tile[] {
  const { observatory, sonar } = scores
  return [
    {
      title: text.headersTitle,
      source: text.headersSource,
      value: observatory?.grade ?? null,
      detail: observatory
        ? text.headersDetail
            .replace('{passed}', String(observatory.testsPassed))
            .replace('{total}', String(observatory.testsTotal))
        : '',
      href: OBSERVATORY_REPORT,
      isGood: observatory?.grade.startsWith('A') ?? false
    },
    {
      title: text.codeTitle,
      source: text.codeSource,
      value: sonar?.securityRating ?? null,
      detail: codeDetail(scores, text),
      href: SONAR_REPORT,
      isGood: sonar?.securityRating === 'A'
    },
    {
      title: text.gateTitle,
      source: text.gateSource,
      value: sonar
        ? sonar.hasPassedQualityGate
          ? text.gatePassed
          : text.gateFailed
        : null,
      detail: text.gateDetail,
      href: SONAR_REPORT,
      isGood: sonar?.hasPassedQualityGate ?? false
    },
    {
      title: text.disclosureTitle,
      source: text.disclosureSource,
      value: text.disclosureValue,
      detail: text.disclosureDetail,
      href: DISCLOSURE_POLICY,
      isGood: true
    }
  ]
}

export function SecurityScorecard({
  scores,
  text
}: Readonly<{ scores: SecurityScores; text: ScorecardText }>) {
  return (
    <section
      aria-labelledby='security-scorecard-title'
      className='border-b border-[var(--s-ink)]/10 px-6 py-20'
    >
      <div className='mx-auto max-w-[1120px]'>
        <p className='font-mono text-xs font-bold uppercase tracking-[0.25em] text-[var(--s-accent)]'>
          {text.label}
        </p>
        <h2
          className='mt-3 max-w-3xl text-3xl font-black tracking-tight md:text-5xl'
          id='security-scorecard-title'
        >
          {text.title}
        </h2>
        <p className='mt-5 max-w-2xl text-lg leading-8 text-[var(--s-ink)]/75'>
          {text.intro}
        </p>
        <ul className='mt-12 grid gap-px bg-[var(--s-ink)]/10 sm:grid-cols-2 lg:grid-cols-4'>
          {buildTiles(scores, text).map((tile) => (
            <li className='bg-[var(--s-bg)]' key={tile.title}>
              <a
                className='group flex h-full flex-col p-6 transition-colors hover:bg-[var(--s-band)] focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[var(--s-accent)]'
                href={tile.href}
                rel={
                  tile.href.startsWith('http')
                    ? 'noopener noreferrer'
                    : undefined
                }
                target={tile.href.startsWith('http') ? '_blank' : undefined}
              >
                <span className='font-mono text-[11px] font-bold uppercase tracking-[0.15em] text-[var(--s-ink)]/60'>
                  {tile.title}
                </span>
                <strong
                  className={`mt-5 font-black leading-none tracking-tighter ${
                    tile.value && tile.isGood ? 'text-[var(--s-accent)]' : 'text-[var(--s-ink)]'
                  } ${(tile.value?.length ?? 0) > 3 ? 'text-3xl md:text-4xl' : 'text-5xl'}`}
                >
                  {tile.value ?? '—'}
                </strong>
                <span className='mt-4 text-sm leading-6 text-[var(--s-ink)]/70'>
                  {tile.value ? tile.detail : text.unavailable}
                </span>
                <span className='mt-auto pt-6 font-mono text-[11px] uppercase tracking-[0.12em] text-[var(--s-ink)]/45 transition-colors group-hover:text-[var(--s-accent)]'>
                  {tile.source} · {text.viewReport}{' '}
                  <span aria-hidden='true'>→</span>
                </span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
