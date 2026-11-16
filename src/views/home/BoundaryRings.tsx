import Link from 'next/link'
import { type CSSProperties, Fragment } from 'react'

import type { HomeCopy } from './copy'

interface RingStyle {
  href: string
  gradient: string
  inner: string
  label: string
  bandSeconds: number
  orbitSeconds: number
  isReversed: boolean
}

const FLOW_STEPS = [0, 1, 2, 3, 4]

/** One entry per ring in `copy.rings`, in the same order. */
const RINGS: RingStyle[] = [
  {
    href: '/blog/the-api-knew-who-i-was-authorization',
    gradient: 'conic-gradient(from 210deg, #0b7a2a, #00ff41, #34d399, #0b7a2a)',
    inner: '#1fa84a',
    label: '#7df59b',
    bandSeconds: 18,
    orbitSeconds: 9,
    isReversed: false
  },
  {
    href: '/blog/agentbaiting-malicious-ai-tools-enterprise-security-2026',
    gradient: 'conic-gradient(from 30deg, #22d3ee, #60a5fa, #a78bfa, #22d3ee)',
    inner: '#6d8fe8',
    label: '#9fdff5',
    bandSeconds: 22,
    orbitSeconds: 12,
    isReversed: true
  },
  {
    href: '/blog/appsec-2026-11-09-build-identity-and-http-boundaries',
    gradient: 'conic-gradient(from 120deg, #fb7185, #f97316, #fbbf24, #fb7185)',
    inner: '#f0884a',
    label: '#ffc98a',
    bandSeconds: 16,
    orbitSeconds: 11,
    isReversed: false
  }
]

function Flow() {
  return (
    <div className='ring-flow' aria-hidden='true'>
      <div>
        {FLOW_STEPS.map((step) => (
          <i key={step} />
        ))}
      </div>
      <div>
        {FLOW_STEPS.map((step) => (
          <i key={step} />
        ))}
      </div>
    </div>
  )
}

/** Animated infographic: the three trust boundaries, each linking to a related article. */
export function BoundaryRings({ text }: Readonly<{ text: HomeCopy }>) {
  return (
    <section className='home-rings' aria-labelledby='home-rings-title'>
      <div className='home-wrap'>
        <div className='home-rings-head'>
          <h2 id='home-rings-title'>{text.ringsTitle}</h2>
          <p>{text.ringsLede}</p>
        </div>
        <div className='ring-row'>
          {RINGS.map((ring, i) => {
            const copy = text.rings[i]
            const orbitStyle: CSSProperties = {
              animationDuration: `${ring.orbitSeconds}s`,
              animationDirection: ring.isReversed ? 'reverse' : 'normal'
            }
            return (
              <Fragment key={ring.href}>
                {i > 0 && <Flow />}
                <div className='ring-item'>
                  <p className='ring-question' style={{ color: ring.label }}>
                    {copy.question}
                  </p>
                  <div className='boundary-ring'>
                    <div
                      className='ring-band'
                      aria-hidden='true'
                      style={{
                        background: ring.gradient,
                        animationDuration: `${ring.bandSeconds}s`
                      }}
                    />
                    <div
                      className='ring-inner'
                      aria-hidden='true'
                      style={{ borderColor: ring.inner }}
                    />
                    <div
                      className='ring-orbit'
                      aria-hidden='true'
                      style={orbitStyle}
                    >
                      <i />
                    </div>
                    <div className='ring-content'>
                      <span className='ring-verb'>{copy.verb}</span>
                      <span className='ring-noun'>{copy.noun}</span>
                      <Link className='ring-link' href={ring.href}>
                        {text.readNotes} <span aria-hidden='true'>→</span>
                      </Link>
                    </div>
                  </div>
                </div>
              </Fragment>
            )
          })}
        </div>
        <div className='ring-loop'>
          <div className='loop-flow' aria-hidden='true'>
            {FLOW_STEPS.map((step) => (
              <i key={step} />
            ))}
          </div>
          <div className='loop-flow loop-flow-back' aria-hidden='true'>
            {FLOW_STEPS.map((step) => (
              <i key={step} />
            ))}
          </div>
          <p>
            <span className='live-dot' aria-hidden='true' />
            {text.loop}
          </p>
        </div>
      </div>
    </section>
  )
}
