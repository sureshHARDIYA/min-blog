export const SITE_URL = 'https://www.skmukhiya.com.np'
export const FEED_AUTHOR = 'Suresh Kumar Mukhiya'

const XML_ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&apos;'
}

export function escapeXml(value: string): string {
  return value.replaceAll(/[&<>"']/g, (character) => XML_ESCAPES[character])
}

/** RFC 822 date, as RSS requires, from a `YYYY-MM-DD` post date. */
export function toRssDate(date: string): string {
  return new Date(`${date}T08:00:00Z`).toUTCString()
}

export function feedResponse(xml: string): Response {
  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control':
        'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400'
    }
  })
}
