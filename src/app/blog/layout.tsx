import type { ReactNode } from 'react'
import { ContentPageHeader } from '../../components/ContentPageHeader'

export default function BlogLayout({ children }: { children: ReactNode }) {
  return <><ContentPageHeader />{children}</>
}
