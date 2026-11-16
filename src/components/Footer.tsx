import React from 'react'

import { useLanguage } from '../i18n/LanguageContext'
import type { Language } from '../i18n/translations'
import { FOOTER_LINKS } from './footerLinks'
import { LanguageSwitcher } from './LanguageSwitcher'
import { ThemeToggle } from './ThemeToggle'

import '../views/home/home.css'

const CAREER_START_YEAR = 2010
const CONTACT_EMAIL = 'itsmeskm99@gmail.com'
const SECURITY_POLICY_URL =
  'https://github.com/sureshHARDIYA/min-blog/blob/main/SECURITY.md'

const COPY: Record<Language, Record<string, string>> = {
  en: {
    eyebrow: 'Have a difficult security decision?',
    title: 'Let’s talk.',
    text: 'Architecture reviews, threat models, second opinions.',
    cta: 'Start a conversation',
    tagline: 'ENGINEERING SINCE {year} · {years} YEARS',
    role: 'Tech Lead, Lerøy Seafood Group',
    city: 'Bergen, Norway',
    site: 'Site',
    blog: 'Blog',
    vulnerabilities: 'Vulnerability Intelligence',
    security: 'Security',
    research: 'Research',
    trajectory: 'Experience',
    stack: 'Stack',
    contact: 'Contact',
    elsewhere: 'Elsewhere',
    resources: 'Resources',
    rss: 'RSS feed',
    podcast: 'Podcast feed',
    cv: 'Download CV',
    policy: 'Security policy',
    privacy: 'Privacy',
    external: 'opens in a new tab'
  },
  no: {
    eyebrow: 'Står du foran en vanskelig sikkerhetsbeslutning?',
    title: 'La oss snakke.',
    text: 'Arkitekturgjennomganger, trusselmodeller, en ekstra vurdering.',
    cta: 'Start en samtale',
    tagline: 'UTVIKLER SIDEN {year} · {years} ÅR',
    role: 'Tech Lead, Lerøy Seafood Group',
    city: 'Bergen, Norge',
    site: 'Nettsted',
    blog: 'Blogg',
    vulnerabilities: 'Sårbarhetsoversikt',
    security: 'Sikkerhet',
    research: 'Forskning',
    trajectory: 'Karriere',
    stack: 'Teknologi',
    contact: 'Kontakt',
    elsewhere: 'Andre steder',
    resources: 'Ressurser',
    rss: 'RSS-feed',
    podcast: 'Podkast-feed',
    cv: 'Last ned CV',
    policy: 'Sikkerhetspolicy',
    privacy: 'Personvern',
    external: 'åpnes i ny fane'
  }
}

export function Footer() {
  const { language } = useLanguage()
  const text = COPY[language] ?? COPY.en
  const year = new Date().getFullYear()
  const tagline = text.tagline
    .replace('{year}', String(CAREER_START_YEAR))
    .replace('{years}', String(year - CAREER_START_YEAR))

  return (
    <footer className='site-footer'>
      <div className='home-wrap footer-cta'>
        <div>
          <p className='footer-cta-eyebrow home-mono'>{text.eyebrow}</p>
          <h2>{text.title}</h2>
        </div>
        <div className='footer-cta-side'>
          <p>{text.text}</p>
          <a className='home-button' href={`mailto:${CONTACT_EMAIL}`}>
            {text.cta} <span aria-hidden='true'>→</span>
          </a>
        </div>
      </div>

      <div className='home-wrap footer-columns'>
        <div className='footer-identity'>
          <strong>Suresh K. Mukhiya, PhD</strong>
          <small className='home-mono'>{tagline}</small>
          <span>
            {text.role}
            <br />
            {text.city}
          </span>
          <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
        </div>

        <nav className='footer-column' aria-label={text.site}>
          <h3>{text.site}</h3>
          <a href='/blogs'>{text.blog}</a>
          <a href='/security'>{text.security}</a>
          <a href='/vulnerabilities'>{text.vulnerabilities}</a>
          <a href='/research'>{text.research}</a>
          <a href='/trajectory'>{text.trajectory}</a>
          <a href='/stack'>{text.stack}</a>
          <a href='/connect'>{text.contact}</a>
        </nav>

        <nav className='footer-column' aria-label={text.elsewhere}>
          <h3>{text.elsewhere}</h3>
          {FOOTER_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              {...(link.isExternal
                ? { target: '_blank', rel: 'noopener noreferrer' }
                : {})}
            >
              {link.label}
              {link.isExternal && (
                <>
                  {' '}
                  <span aria-hidden='true'>↗</span>
                  <span className='home-sr-only'> ({text.external})</span>
                </>
              )}
            </a>
          ))}
        </nav>

        <nav className='footer-column' aria-label={text.resources}>
          <h3>{text.resources}</h3>
          <a href='/rss.xml'>{text.rss}</a>
          <a href='/podcast.xml'>{text.podcast}</a>
          <a
            href='/Suresh_Kumar_Mukhiya_CV.pdf'
            target='_blank'
            rel='noopener noreferrer'
            download='Suresh_Kumar_Mukhiya_CV.pdf'
          >
            {text.cv}
          </a>
        </nav>
      </div>

      <div className='footer-bar'>
        <div className='home-wrap footer-bar-inner'>
          <span>© {year} Suresh Kumar Mukhiya</span>
          <div className='footer-bar-links'>
            <a
              href={SECURITY_POLICY_URL}
              target='_blank'
              rel='noopener noreferrer'
            >
              {text.policy}
            </a>
            <a href='/.well-known/security.txt'>security.txt</a>
            <a href='/privacy'>{text.privacy}</a>
          </div>
          <div className='footer-bar-links'>
            <LanguageSwitcher />
            <ThemeToggle />
          </div>
        </div>
      </div>
    </footer>
  )
}
