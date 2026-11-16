import type { ReactNode } from 'react'
import { SiteChrome } from '../../components/SiteChrome'

export default function SecurityLayout({ children }: { children: ReactNode }) {
  return <SiteChrome active='security'>{children}</SiteChrome>
}
