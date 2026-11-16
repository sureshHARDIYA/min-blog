import type { ReactNode } from 'react'
import { SiteChrome } from '../../components/SiteChrome'

export default function PrivacyLayout({ children }: { children: ReactNode }) {
  return <SiteChrome active={null}>{children}</SiteChrome>
}
