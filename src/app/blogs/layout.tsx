import type { ReactNode } from 'react'
import { ContentPageHeader } from '../../components/ContentPageHeader'

export default function BlogsLayout({ children }: { children: ReactNode }) {
  return <><ContentPageHeader />{children}</>
}
