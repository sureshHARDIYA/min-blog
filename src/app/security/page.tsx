import type { Metadata } from 'next'
import { SecurityContent } from './SecurityContent'

const siteUrl = 'https://www.skmukhiya.com.np'
const pageUrl = `${siteUrl}/security`

export const metadata: Metadata = {
  title: 'Application Security | Applikasjonssikkerhet',
  description: 'Application security, secure APIs, threat modelling, DevSecOps and software-supply-chain security in English and Norwegian.',
  alternates: { canonical: pageUrl },
  openGraph: {
    type: 'profile', url: pageUrl, title: 'Application Security | Applikasjonssikkerhet',
    description: 'Secure APIs, threat modelling, DevSecOps and software-supply-chain risk.',
    siteName: 'Suresh Kumar Mukhiya, PhD', locale: 'en_NO', alternateLocale: ['nb_NO'],
  },
}

export default function SecurityPage() {
  return <SecurityContent />
}
