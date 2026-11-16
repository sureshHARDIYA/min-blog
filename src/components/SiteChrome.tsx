'use client'

import type { ReactNode } from 'react'

import { Footer } from './Footer'
import { Header, type HeaderActive } from './Header'

/**
 * The shared header and footer for every page outside the single-page app,
 * which renders the same two components itself so its tabs can switch in place.
 * The header is fixed, so each page keeps its own top padding.
 */
export function SiteChrome({
  active,
  children
}: Readonly<{ active: HeaderActive; children: ReactNode }>) {
  return (
    <>
      <Header activeTab={active} />
      {children}
      <Footer />
    </>
  )
}
