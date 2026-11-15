import { NextResponse, type NextRequest } from 'next/server'

function createNonce() {
  return btoa(crypto.randomUUID()).replace(/=+$/u, '')
}

// Origins allowed to serve narration audio. Override with ARTICLE_AUDIO_ORIGINS
// (space-separated) when the R2 bucket moves to a custom domain.
const DEFAULT_AUDIO_ORIGIN =
  'https://pub-f80efacb39074f8597b4cc46baea34da.r2.dev'

function audioOrigins() {
  const configured = (process.env.ARTICLE_AUDIO_ORIGINS ?? '')
    .split(/\s+/u)
    .filter((origin) => /^https:\/\/[\w.-]+$/u.test(origin))
  return configured.length > 0 ? configured : [DEFAULT_AUDIO_ORIGIN]
}

function contentSecurityPolicy(nonce: string) {
  const scriptSources = [
    "'self'",
    `'nonce-${nonce}'`,
    "'strict-dynamic'",
    ...(process.env.NODE_ENV === 'development' ? ["'unsafe-eval'"] : [])
  ]

  return [
    "default-src 'self'",
    `script-src ${scriptSources.join(' ')}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https://avatars.githubusercontent.com https://lh3.googleusercontent.com",
    "font-src 'self'",
    `media-src 'self' blob: ${audioOrigins().join(' ')}`,
    "connect-src 'self' https://*.google-analytics.com https://www.google.com https://www.gstatic.com https://formspree.io",
    'frame-src https://www.google.com https://recaptcha.google.com',
    "worker-src 'self' blob:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    'upgrade-insecure-requests'
  ].join('; ')
}

export function proxy(request: NextRequest) {
  const nonce = createNonce()
  const policy = contentSecurityPolicy(nonce)
  const requestHeaders = new Headers(request.headers)

  requestHeaders.set('Content-Security-Policy', policy)
  requestHeaders.set('x-nonce', nonce)

  const response = NextResponse.next({
    request: { headers: requestHeaders }
  })

  response.headers.set('Content-Security-Policy', policy)
  return response
}

export const config = {
  matcher: [
    {
      source:
        '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
      missing: [
        { type: 'header', key: 'next-router-prefetch' },
        { type: 'header', key: 'purpose', value: 'prefetch' }
      ]
    }
  ]
}
