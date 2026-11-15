'use client'

import type { ReactNode } from 'react'
import { Header } from '../../components/Header'
import { ThemeProvider } from '../../context/ThemeContext'

export default function BlogsLayout({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <Header activeTab='blogs' />
      {children}
    </ThemeProvider>
  )
}
