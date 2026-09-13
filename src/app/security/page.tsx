import type { Metadata } from 'next'
import { SecurityContent } from './SecurityContent'

const siteUrl = 'https://www.skmukhiya.com.np'
const pageUrl = `${siteUrl}/security`
const pageTitle = 'Application Security'
const pageDescription =
  'Practical application security, secure API design, threat modelling, DevSecOps and software supply-chain guidance grounded in engineering work.'

export const metadata: Metadata = {
  title: pageTitle,
  description: pageDescription,
  alternates: { canonical: pageUrl },
  openGraph: {
    type: 'website',
    url: pageUrl,
    title: pageTitle,
    description: pageDescription,
    siteName: 'Suresh Kumar Mukhiya, PhD',
    locale: 'en_NO'
  }
}

const securityJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  '@id': `${pageUrl}#collection`,
  url: pageUrl,
  name: 'Application Security & Secure Software Architecture',
  description: pageDescription,
  inLanguage: 'en',
  author: { '@id': `${siteUrl}/#person` },
  isPartOf: { '@id': `${siteUrl}/#website` },
  about: [
    'Application Security',
    'API Security',
    'Threat Modelling',
    'DevSecOps',
    'Software Supply Chain Security'
  ]
}

export default function SecurityPage() {
  return (
    <>
      <script
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(securityJsonLd).replaceAll('<', '\\u003c')
        }}
        type='application/ld+json'
      />
      <SecurityContent />
    </>
  )
}
