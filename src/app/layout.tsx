import React from 'react';
import type { Metadata } from 'next';
import Script from 'next/script';
import './globals.css';

const recaptchaSiteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
const siteUrl = 'https://skmukhiya.com.np';
const siteTitle = 'Suresh Kumar Mukhiya, PhD | System Architect, Cybersecurity & AI';
const siteDescription = 'Portfolio of Suresh Kumar Mukhiya, PhD: system architecture, cybersecurity, AI, adaptive systems, software engineering research, publications, talks, and technical leadership in Norway.';

const personJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: 'Suresh Kumar Mukhiya',
  honorificSuffix: 'PhD',
  url: siteUrl,
  image: `${siteUrl}/favicon-192x192.png`,
  jobTitle: 'Tech Lead and System Architect',
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
    'System Architecture',
    'Cybersecurity',
    'Artificial Intelligence',
    'Adaptive Systems',
    'Software Engineering',
    'Distributed Systems',
    'Health Informatics',
  ],
  sameAs: [
    'https://github.com/sureshHARDIYA',
    'https://github.com/sureshHARDIYA/phd-resources',
    'https://www.linkedin.com/in/sureshhardiya/',
    'https://www.youtube.com/@SureshKUMARMukhiya',
    'https://scholar.google.com/citations?user=9-fxxeMAAAAJ',
    'https://hdl.handle.net/11250/2778982',
    'https://skm-presents.netlify.app/',
  ],
};

const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Suresh Kumar Mukhiya, PhD',
  url: siteUrl,
  description: siteDescription,
  inLanguage: ['en', 'no', 'ne'],
  author: {
    '@type': 'Person',
    name: 'Suresh Kumar Mukhiya',
  },
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: siteTitle,
    template: '%s | Suresh Kumar Mukhiya, PhD',
  },
  description: siteDescription,
  keywords: [
    'Suresh Kumar Mukhiya',
    'Suresh Mukhiya',
    'system architect Norway',
    'cybersecurity',
    'AI engineering',
    'adaptive systems',
    'software engineering PhD',
    'HVL PhD thesis',
    'Internet-Delivered Psychological Treatments',
  ],
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
