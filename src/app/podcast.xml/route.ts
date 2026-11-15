import { getArticleAudioDetails } from '../../lib/articleAudio'
import { getAllPosts } from '../../lib/blog'
import {
  escapeXml,
  FEED_AUTHOR,
  feedResponse,
  SITE_URL,
  toRssDate
} from '../../lib/feed'

const ARTWORK_URL = `${SITE_URL}/suresh-portrait.png`

/** Podcast feed of narrated articles. Only articles with a full-episode MP3 are listed. */
export async function GET(): Promise<Response> {
  const posts = await getAllPosts()
  const narrated = await Promise.all(
    posts.map(async (post) => ({
      post,
      episode: (await getArticleAudioDetails(post.slug, post.content)).episode
    }))
  )
  const items = narrated.flatMap(({ post, episode }) => {
    if (!episode) return []
    const url = `${SITE_URL}/blog/${post.slug}`
    return [
      `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="false">${escapeXml(episode.url)}</guid>
      <pubDate>${toRssDate(post.date)}</pubDate>
      <description>${escapeXml(post.description)}</description>
      <enclosure url="${escapeXml(episode.url)}" length="${episode.bytes}" type="audio/mpeg" />
      <itunes:duration>${Math.round(episode.duration)}</itunes:duration>
      <itunes:explicit>false</itunes:explicit>
    </item>`
    ]
  })

  return feedResponse(`<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd">
  <channel>
    <title>${escapeXml(`${FEED_AUTHOR}: narrated field notes`)}</title>
    <link>${SITE_URL}/blogs</link>
    <atom:link href="${SITE_URL}/podcast.xml" rel="self" type="application/rss+xml" />
    <description>Narrated cybersecurity and software architecture articles. Narration is synthesized from the written articles.</description>
    <language>en</language>
    <itunes:author>${escapeXml(FEED_AUTHOR)}</itunes:author>
    <itunes:explicit>false</itunes:explicit>
    <itunes:image href="${ARTWORK_URL}" />
    <itunes:category text="Technology" />
    <image>
      <url>${ARTWORK_URL}</url>
      <title>${escapeXml(`${FEED_AUTHOR}: narrated field notes`)}</title>
      <link>${SITE_URL}/blogs</link>
    </image>
${items.join('\n')}
  </channel>
</rss>
`)
}
