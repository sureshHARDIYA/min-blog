import type { Metadata } from 'next'
import { PrivacyContent } from './PrivacyContent'

export const metadata: Metadata = {
  title: 'Privacy notice | Personvernerklæring',
  description: 'How this website handles optional analytics and necessary browser storage. Slik håndterer nettstedet analyse og nødvendig nettleserlagring.',
  alternates: { canonical: '/privacy' },
}

export default function PrivacyPage() {
  return <PrivacyContent />
}
