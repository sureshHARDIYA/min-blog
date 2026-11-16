import type { ReactNode } from 'react'
import { SiteChrome } from '../../components/SiteChrome'

export default function VulnerabilitiesLayout({
  children
}: Readonly<{ children: ReactNode }>) {
  return <SiteChrome active={null}>{children}</SiteChrome>
}
