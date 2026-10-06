'use client'

import Link from 'next/link'
import { useTheme } from '../context/ThemeContext'

const capabilities = [
  {
    number: '01',
    title: 'Application security',
    description: 'OWASP ASVS, threat modelling and security-focused code review.'
  },
  {
    number: '02',
    title: 'API and identity',
    description: 'Entra ID, authorization boundaries, Zero Trust and tenant isolation.'
  },
  {
    number: '03',
    title: 'Software supply chain',
    description: 'SBOM, Dependency-Track, dependency risk and trusted build pipelines.'
  },
  {
    number: '04',
    title: 'Operational assurance',
    description: 'Actionable telemetry, incident runbooks and evidence-based remediation.'
  }
] as const

const evidenceLinks = [
  {
    label: 'API security case study',
    title: 'The API knew who I was',
    href: '/blog/the-api-knew-who-i-was-authorization'
  },
  {
    label: 'Featured AppSec brief',
    title: 'Cache and sandbox boundaries',
    href: '/blog/appsec-2026-10-05-cache-and-sandbox-boundaries'
  },
  {
    label: 'Security practice',
    title: 'Explore security work',
    href: '/security'
  }
] as const

export function SecurityEvidence() {
  const { theme } = useTheme()
  const accent = theme === 'light' ? 'text-[#008822]' : 'text-[#00FF41]'
  const muted = theme === 'light' ? 'text-slate-600' : 'text-white/65'
  const border = theme === 'light' ? 'border-slate-300' : 'border-white/10'

  return (
    <section
      aria-labelledby='security-evidence-title'
      className='mb-0 p-5 md:p-6'
    >
      <div className='grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-end'>
        <header>
          <p className={`font-code text-[11px] font-bold uppercase tracking-[0.28em] ${accent}`}>
            Security engineering evidence
          </p>
          <h2
            className={`mt-4 max-w-3xl text-3xl font-black leading-[0.98] tracking-tight md:text-5xl ${
              theme === 'light' ? 'text-slate-900' : 'text-[#F5F5F5]'
            }`}
            id='security-evidence-title'
          >
            Application Security &amp; Secure Architecture
          </h2>
        </header>
        <div>
          <p className={`text-base leading-7 md:text-lg ${muted}`}>
            Public analysis, architecture decisions and repeatable engineering controls
            showing how security is applied in practice.
          </p>
          <Link
            className={`mt-5 inline-flex items-center gap-2 font-code text-xs font-bold uppercase tracking-widest ${accent}`}
            href='/security'
          >
            Explore security work <span aria-hidden='true'>→</span>
          </Link>
        </div>
      </div>

      <div className={`mt-9 grid gap-px border-y ${border} md:grid-cols-2 lg:grid-cols-4`}>
        {capabilities.map((capability) => (
          <article
            className={`py-6 md:px-5 md:first:pl-0 lg:border-l lg:first:border-l-0 ${
              theme === 'light' ? 'lg:border-slate-300' : 'lg:border-white/10'
            }`}
            key={capability.number}
          >
            <span className={`font-code text-xs font-bold ${accent}`}>
              {capability.number}
            </span>
            <h3
              className={`mt-4 text-lg font-bold ${
                theme === 'light' ? 'text-slate-900' : 'text-[#F5F5F5]'
              }`}
            >
              {capability.title}
            </h3>
            <p className={`mt-3 text-sm leading-6 ${muted}`}>
              {capability.description}
            </p>
          </article>
        ))}
      </div>

      <div className='mt-8 grid gap-5 md:grid-cols-3'>
        {evidenceLinks.map((item) => (
          <Link
            className={`group border-l-2 pl-4 transition-colors ${
              theme === 'light'
                ? 'border-slate-300 hover:border-[#008822]'
                : 'border-white/15 hover:border-[#00FF41]'
            }`}
            href={item.href}
            key={item.href}
          >
            <span className={`font-code text-[10px] font-bold uppercase tracking-[0.18em] ${accent}`}>
              {item.label}
            </span>
            <span
              className={`mt-2 flex items-center justify-between gap-3 text-sm font-semibold ${
                theme === 'light' ? 'text-slate-800' : 'text-white/85'
              }`}
            >
              {item.title}
              <span aria-hidden='true' className='transition-transform group-hover:translate-x-1'>↗</span>
            </span>
          </Link>
        ))}
      </div>
    </section>
  )
}
