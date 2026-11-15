import { getAllPosts } from '../../lib/blog'
import {
  escapeXml,
  FEED_AUTHOR,
  feedResponse,
  SITE_URL,
  toRssDate
} from '../../lib/feed'

export async function GET(): Promise<Response> {
  const posts = await getAllPosts()
  const items = posts.map((post) => {
    const url = `${SITE_URL}/blog/${post.slug}`
    return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${toRssDate(post.date)}</pubDate>
      <category>${escapeXml(post.category)}</category>
      <description>${escapeXml(post.description)}</description>
    </item>`
  })

  return feedResponse(`<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(`${FEED_AUTHOR}, PhD: AppSec and architecture field notes`)}</title>
    <link>${SITE_URL}/blogs</link>
    <atom:link href="${SITE_URL}/rss.xml" rel="self" type="application/rss+xml" />
    <description>Cybersecurity and software architecture field notes, including the weekly AppSec brief.</description>
    <language>en</language>
${posts[0] ? `    <lastBuildDate>${toRssDate(posts[0].date)}</lastBuildDate>\n` : ''}${items.join('\n')}
  </channel>
</rss>
`)
}
