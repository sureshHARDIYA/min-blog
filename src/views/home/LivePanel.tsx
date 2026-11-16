'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'

import type { BlogPostSummary } from '../../components/BlogPostCard'
import activity from '../../generated/github-activity.json'
import type { SecurityScores } from '../../lib/securityScores'
import type { HomeCopy } from './copy'

type TabId = 'activity' | 'brief' | 'verified'

const ROTATE_MS = 7000
const CHART_WIDTH = 480
const CHART_HEIGHT = 160
const CHART_BASELINE = 150
const CHART_PEAK = 20
const LEGEND_SIZE = 4
const BAR_COLORS = [
  'var(--c-1)',
  'var(--c-2)',
  'var(--c-3)',
  'var(--c-4)',
  'var(--c-5)'
]
const OBSERVATORY_REPORT =
  'https://developer.mozilla.org/en-US/observatory/analyze?host=www.skmukhiya.com.np'
const SONAR_REPORT =
  'https://sonarcloud.io/summary/overall?id=sureshHARDIYA_min-blog'

function chartPoints(): string {
  const weeks = activity.activityWeeks
  const max = Math.max(...weeks.map((week) => week.commits), 1)
  const step = CHART_WIDTH / Math.max(weeks.length - 1, 1)
  return weeks
    .map((week, i) => {
      const y =
        CHART_BASELINE - (week.commits / max) * (CHART_BASELINE - CHART_PEAK)
      return `${(i * step).toFixed(1)},${y.toFixed(1)}`
    })
    .join(' ')
}

function languageShares(otherLabel: string) {
  const top = activity.languages.slice(0, LEGEND_SIZE)
  const rest = Math.max(
    0,
    100 - top.reduce((sum, language) => sum + language.percentage, 0)
  )
  return [
    ...top.map((language) => ({
      name: language.name,
      share: language.percentage
    })),
    { name: otherLabel, share: Number(rest.toFixed(1)) }
  ]
}

function ActivityTab({ text }: Readonly<{ text: HomeCopy }>) {
  const points = chartPoints()
  const weeks = activity.activityWeeks
  const shares = languageShares(text.other)
  return (
    <>
      <div className='live-row'>
        <strong>{text.activityTitle}</strong>
        <span className='home-mono'>
          {weeks[0]?.label} – {weeks.at(-1)?.label}
        </span>
      </div>
      <svg
        className='live-chart'
        role='img'
        aria-label={text.activityAlt}
        viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
        preserveAspectRatio='none'
      >
        <path
          className='live-chart-grid'
          d='M0 40H480M0 80H480M0 120H480M0 150H480'
          vectorEffect='non-scaling-stroke'
        />
        <polygon
          className='live-chart-area'
          points={`${points} ${CHART_WIDTH},${CHART_BASELINE} 0,${CHART_BASELINE}`}
        />
        <polyline
          className='live-chart-line'
          points={points}
          vectorEffect='non-scaling-stroke'
        />
      </svg>
      <div className='live-stats'>
        <div>
          <strong>{activity.recentCommits}</strong>
          <span>{text.commits}</span>
        </div>
        <div>
          <strong>{activity.repositoriesAnalyzed}</strong>
          <span>{text.repositories}</span>
        </div>
        <div>
          <strong>
            {new Date(activity.profile.joinedAt).getUTCFullYear()}
          </strong>
          <span>{text.since}</span>
        </div>
      </div>
      <div className='live-bar' aria-hidden='true'>
        {shares.map((item, i) => (
          <div
            key={item.name}
            style={{ width: `${item.share}%`, background: BAR_COLORS[i] }}
          />
        ))}
      </div>
      <ul className='live-legend'>
        {shares.map((item, i) => (
          <li key={item.name}>
            <i aria-hidden='true' style={{ background: BAR_COLORS[i] }} />
            <b>{item.name}</b> {item.share}%
          </li>
        ))}
      </ul>
    </>
  )
}

function BriefTab({
  post,
  text,
  locale
}: Readonly<{ post: BlogPostSummary; text: HomeCopy; locale: string }>) {
  const date = new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC'
  }).format(new Date(post.date))
  return (
    <>
      <p className='live-tag home-mono'>
        <span>{post.category ?? 'AppSec Brief'}</span>
        <span>{date}</span>
      </p>
      <h2 className='live-brief-title'>
        {post.title.replace(/^AppSec Lead Brief:\s*/i, '')}
      </h2>
      <p className='live-brief-text'>{post.description}</p>
      <Link className='home-text-link' href={`/blog/${post.slug}`}>
        {text.readBrief} <span aria-hidden='true'>→</span>
      </Link>
    </>
  )
}

function VerifiedTab({
  scores,
  text
}: Readonly<{ scores: SecurityScores | null; text: HomeCopy }>) {
  const observatory = scores?.observatory
  const sonar = scores?.sonar
  return (
    <div>
      {observatory && (
        <a
          className='live-score'
          href={OBSERVATORY_REPORT}
          target='_blank'
          rel='noopener noreferrer'
        >
          <strong>{observatory.grade}</strong>
          <span>
            <b>{text.headers}</b>
            <span>
              {text.headersDetail
                .replace('{passed}', String(observatory.testsPassed))
                .replace('{total}', String(observatory.testsTotal))}
            </span>
          </span>
        </a>
      )}
      {sonar && (
        <a
          className='live-score'
          href={SONAR_REPORT}
          target='_blank'
          rel='noopener noreferrer'
        >
          <strong>
            {sonar.hasPassedQualityGate ? text.gatePassed : text.gateFailed}
          </strong>
          <span>
            <b>{text.gate}</b>
            <span>{text.gateDetail}</span>
          </span>
        </a>
      )}
      <a className='live-score' href='/.well-known/security.txt'>
        <strong>{text.reportingValue}</strong>
        <span>
          <b>{text.reporting}</b>
          <span>{text.reportingDetail}</span>
        </span>
      </a>
    </div>
  )
}

interface LivePanelProps {
  brief: BlogPostSummary | undefined
  scores: SecurityScores | null
  text: HomeCopy
  locale: string
}

/** Rotating hero panel: live GitHub activity, the newest brief, and third-party verification. */
export function LivePanel({
  brief,
  scores,
  text,
  locale
}: Readonly<LivePanelProps>) {
  const tabs: { id: TabId; label: string }[] = [
    { id: 'activity', label: text.tabActivity },
    ...(brief ? [{ id: 'brief' as const, label: text.tabBrief }] : []),
    { id: 'verified', label: text.tabVerified }
  ]
  const [active, setActive] = useState<TabId>('activity')
  const isPaused = useRef(false)
  const tabCount = tabs.length

  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const order: TabId[] = brief
      ? ['activity', 'brief', 'verified']
      : ['activity', 'verified']
    const timer = setInterval(() => {
      if (isPaused.current) return
      setActive((current) => order[(order.indexOf(current) + 1) % order.length])
    }, ROTATE_MS)
    return () => clearInterval(timer)
  }, [brief, tabCount])

  const setPaused = (value: boolean) => () => {
    isPaused.current = value
  }

  return (
    <section
      className='live-panel'
      aria-label={text.panelLabel}
      onMouseEnter={setPaused(true)}
      onMouseLeave={setPaused(false)}
      onFocus={setPaused(true)}
      onBlur={setPaused(false)}
    >
      <div className='live-panel-head'>
        <div className='live-tabs' role='tablist' aria-label={text.panelLabel}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type='button'
              role='tab'
              id={`live-tab-${tab.id}`}
              aria-selected={active === tab.id}
              aria-controls='live-panel-body'
              className='live-tab'
              onClick={() => setActive(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <span className='live-badge home-mono'>
          <span className='live-dot' aria-hidden='true' />
          {text.live}
        </span>
      </div>
      <div
        className='live-body'
        id='live-panel-body'
        role='tabpanel'
        aria-labelledby={`live-tab-${active}`}
        key={active}
      >
        {active === 'activity' && <ActivityTab text={text} />}
        {active === 'brief' && brief && (
          <BriefTab post={brief} text={text} locale={locale} />
        )}
        {active === 'verified' && <VerifiedTab scores={scores} text={text} />}
      </div>
    </section>
  )
}
