'use client'

import Link from 'next/link'

import { AppSecSubscribeForm } from '../../components/AppSecSubscribeForm'
import type { BlogPostSummary } from '../../components/BlogPostCard'
import { GitHubTechnologyMap } from '../../components/GitHubTechnologyMap'
import { HeroPlayer } from '../../components/HeroPlayer'
import { SlowCarousel } from '../../components/SlowCarousel'
import { useLanguage } from '../../i18n/LanguageContext'
import { BoundaryRings } from './BoundaryRings'
import { HOME_COPY } from './copy'
import { RotatingPhrase } from './RotatingPhrase'

import './home.css'

const BRIEF_LIST_SIZE = 4
const BRIEF_PREFIX = /^AppSec Lead Brief:\s*/i

function isBrief(post: BlogPostSummary): boolean {
  return post.slug.startsWith('appsec-')
}

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1)
}

interface HomeViewProps {
  latestPosts: BlogPostSummary[]
}

export function HomeView({ latestPosts }: Readonly<HomeViewProps>) {
  const { language, t } = useLanguage()
  const text = HOME_COPY[language] ?? HOME_COPY.en
  const locale = language === 'no' ? 'nb-NO' : 'en-GB'
  const shortDate = new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: 'short',
    timeZone: 'UTC'
  })

  const latestBrief = latestPosts.find(isBrief) ?? latestPosts[0]
  // The lead story is the newest long-form article; the weekly briefs are listed beside it.
  const lead = latestPosts.find((post) => !isBrief(post)) ?? latestPosts[0]
  const briefs = latestPosts
    .filter((post) => isBrief(post) && post !== lead)
    .slice(0, BRIEF_LIST_SIZE)

  return (
    <div className='home'>
      <section className='home-hero'>
        <div className='home-wrap'>
          <h1 className='home-sr-only'>
            Suresh Kumar Mukhiya, PhD: application security and software
            architecture
          </h1>
          <SlowCarousel
            ariaLabel='Introduction'
            slides={[
              {
                id: 'github-activity',
                label: 'GitHub engineering activity',
                content: (
                  <div className='home-slide'>
                    <GitHubTechnologyMap compact />
                  </div>
                )
              },
              {
                id: 'statement',
                label: 'Introduction',
                content: (
                  <div className='home-slide home-hero-grid'>
                    <div className='home-hero-copy'>
                      <p className='home-eyebrow home-mono'>{text.eyebrow}</p>
                      <h2 className='home-headline'>
                        {text.titleStart}{' '}
                        <RotatingPhrase phrases={text.titleAccents} />
                      </h2>
                      <p className='home-lede'>{text.lede}</p>
                      <div className='home-actions'>
                        {latestBrief && (
                          <Link
                            className='home-button home-button-primary'
                            href={`/blog/${latestBrief.slug}`}
                          >
                            {text.ctaBrief} <span aria-hidden='true'>→</span>
                          </Link>
                        )}
                        <a
                          className='home-button home-button-secondary'
                          href='/connect'
                        >
                          {text.ctaContact}
                        </a>
                      </div>
                    </div>
                    <div className='home-portrait'>
                      <HeroPlayer
                        nodeLabel={t.hero.nodeLabel}
                        name='Suresh Kumar Mukhiya, PhD'
                        title={t.hero.tag}
                      />
                    </div>
                  </div>
                )
              }
            ]}
          />
        </div>
      </section>

      <BoundaryRings text={text} />

      {lead && (
        <section className='home-section' aria-labelledby='home-writing-title'>
          <div className='home-wrap'>
            <div className='home-section-head'>
              <h2 id='home-writing-title'>{text.writingTitle}</h2>
              <Link className='home-text-link' href='/blogs'>
                {text.writingAll} <span aria-hidden='true'>→</span>
              </Link>
            </div>
            <div className='home-writing-grid'>
              <Link className='home-lead' href={`/blog/${lead.slug}`}>
                <p className='live-tag home-mono'>
                  <span>{lead.category ?? 'Field Notes'}</span>
                  <span>
                    {capitalize(shortDate.format(new Date(lead.date)))}
                  </span>
                </p>
                <h3>{lead.title}</h3>
                <p>{lead.description}</p>
                <span className='home-text-link'>
                  {text.readArticle} <span aria-hidden='true'>→</span>
                </span>
              </Link>
              {briefs.length > 0 && (
                <div className='home-list'>
                  <p className='home-list-title'>{text.briefList}</p>
                  {briefs.map((post) => (
                    <Link href={`/blog/${post.slug}`} key={post.slug}>
                      <time className='home-mono' dateTime={post.date}>
                        {shortDate.format(new Date(post.date))}
                      </time>
                      <span>
                        {capitalize(post.title.replace(BRIEF_PREFIX, ''))}
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      <section className='home-section' aria-labelledby='home-work-title'>
        <div className='home-wrap home-work'>
          <h2 id='home-work-title'>{text.workTitle}</h2>
          <div>
            {text.work.map((item, i) => (
              <div className='home-work-row' key={item.title}>
                <span className='home-mono'>
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className='home-brief' aria-labelledby='home-brief-title'>
        <div className='home-wrap home-brief-grid'>
          <div>
            <h2 id='home-brief-title'>{text.subscribeTitle}</h2>
            <p>{text.subscribeText}</p>
          </div>
          <div>
            <AppSecSubscribeForm />
          </div>
        </div>
      </section>
    </div>
  )
}
