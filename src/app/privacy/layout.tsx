import type { ReactNode } from 'react'
import { SiteChrome } from '../../components/SiteChrome'

export default function PrivacyLayout({
  children
}: Readonly<{ children: ReactNode }>) {
  return <SiteChrome active={null}>{children}</SiteChrome>
}
