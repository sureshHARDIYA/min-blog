'use client'

import type { ReactNode } from 'react'
import { ThemeProvider } from '../context/ThemeContext'
import { Header } from './Header'

export default function BlogLayout({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <Header activeTab='blogs' />
      {children}
    </ThemeProvider>
  )
}
