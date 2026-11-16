import type { ReactNode } from 'react'
import { SiteChrome } from './SiteChrome'

export default function BlogLayout({ children }: { children: ReactNode }) {
  return <SiteChrome active='blog'>{children}</SiteChrome>
}
