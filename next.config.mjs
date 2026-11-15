// Headers for every response. The Content-Security-Policy is set per request in
// src/proxy.ts because it carries a nonce; HSTS is set by the hosting platform.
const SECURITY_HEADERS = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Permissions-Policy',
    value:
      'camera=(), microphone=(), geolocation=(), payment=(), usb=()'
  },
  // Allows the reCAPTCHA popup flow while isolating the page from other openers.
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin-allow-popups' }
]

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    unoptimized: true
  },
  async headers() {
    return [{ source: '/:path*', headers: SECURITY_HEADERS }]
  }
}

export default nextConfig
