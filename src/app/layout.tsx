import React from 'react';
import type { Metadata } from 'next';
import Script from 'next/script';
import './globals.css';

const recaptchaSiteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
const siteUrl = 'https://skmukhiya.com.np';
const personId = `${siteUrl}/#person`;
const websiteId = `${siteUrl}/#website`;
const siteTitle = 'Suresh Kumar Mukhiya, PhD | Tech Lead and Software Architect';
const siteDescription =
  'Writing and project work from Suresh Kumar Mukhiya, a Tech Lead in Bergen working across software architecture, application security, cloud systems and AI.';

const personJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  '@id': personId,
  name: 'Suresh Kumar Mukhiya',
  honorificSuffix: 'PhD',
  url: siteUrl,
  image: `${siteUrl}/favicon-192x192.png`,
  jobTitle: 'Tech Lead',
  worksFor: {
    '@type': 'Organization',
    name: 'Lerøy Seafood Group',
  },
  alumniOf: [
    {
      '@type': 'CollegeOrUniversity',
      name: 'Western Norway University of Applied Sciences',
      alternateName: 'HVL',
    },
    {
      '@type': 'CollegeOrUniversity',
      name: 'Norwegian University of Science and Technology',
      alternateName: 'NTNU',
    },
  ],
  knowsAbout: [
    'Software Architecture',
    'Application Security',
    'API Security',
    'DevSecOps',
    'Software Supply Chain Security',
    'Cloud Architecture',
    'Artificial Intelligence',
    'Adaptive Systems',
  ],
  sameAs: [
    'https://github.com/sureshHARDIYA',
    'https://www.linkedin.com/in/sureshhardiya/',
    'https://scholar.google.com/citations?user=9-fxxeMAAAAJ',
    'https://www.youtube.com/@SureshKUMARMukhiya',
  ],
};

const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': websiteId,
  name: 'Suresh Kumar Mukhiya, PhD',
  url: siteUrl,
  description: siteDescription,
  inLanguage: 'en',
  author: {
    '@id': personId,
  },
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: siteTitle,
    template: '%s | Suresh Kumar Mukhiya, PhD',
  },
  description: siteDescription,
  authors: [{ name: 'Suresh Kumar Mukhiya', url: siteUrl }],
  creator: 'Suresh Kumar Mukhiya',
  publisher: 'Suresh Kumar Mukhiya',
  openGraph: {
    type: 'profile',
    url: siteUrl,
    title: siteTitle,
    description: siteDescription,
    siteName: 'Suresh Kumar Mukhiya, PhD',
    locale: 'en_US',
    images: [
      {
        url: '/favicon-192x192.png',
        width: 192,
        height: 192,
        alt: 'Suresh Kumar Mukhiya, PhD',
      },
    ],
  },
  twitter: {
    card: 'summary',
    title: siteTitle,
    description: siteDescription,
    images: ['/favicon-192x192.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon.png', type: 'image/png', sizes: '32x32' },
      { url: '/favicon-128x128.png', type: 'image/png', sizes: '128x128' },
      { url: '/favicon-192x192.png', type: 'image/png', sizes: '192x192' },
    ],
    apple: '/favicon.png',
  },
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;700;800&family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-[#0C0C0C] text-[#F5F5F5] antialiased">
        {children}
        <Script
          id="person-json-ld"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
        />
        <Script
          id="website-json-ld"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        {recaptchaSiteKey && (
          <Script
            src={`https://www.google.com/recaptcha/api.js?render=${recaptchaSiteKey}`}
            strategy="afterInteractive"
          />
        )}
      </body>
    </html>
  );
}
