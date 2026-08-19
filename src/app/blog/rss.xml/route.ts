import { getAllPosts, postUrl } from "@/lib/blog";
import { siteConfig } from "@/data/site";

/**
 * RSS 2.0 feed at /blog/rss.xml.
 *
 * Beyond letting readers subscribe, a feed is the fastest discovery route for
 * a site publishing daily: crawlers and aggregators poll it directly instead
 * of waiting to re-crawl the index and notice a new card.
 *
 * Statically generated with the rest of the build — the post list only changes
 * when the repo does, so there is nothing to recompute per request.
 */
export const dynamic = "force-static";

/**
 * Escapes the five XML predefined entities. Post titles and excerpts are
 * author-written prose and will eventually contain an ampersand or a quote,
 * either of which makes the document non-parseable if emitted raw.
 */
function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const posts = getAllPosts();
  const feedUrl = `${siteConfig.brand.url}/blog/rss.xml`;

  const items = posts
    .map((post) => {
      // RFC 822 is what RSS 2.0 specifies for pubDate; toUTCString produces it.
      const pubDate = new Date(`${post.date}T00:00:00Z`).toUTCString();

      return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${postUrl(post.slug)}</link>
      <guid isPermaLink="true">${postUrl(post.slug)}</guid>
      <description>${escapeXml(post.excerpt)}</description>
      <pubDate>${pubDate}</pubDate>
${(post.tags ?? [])
  .map((tag) => `      <category>${escapeXml(tag)}</category>`)
  .join("\n")}
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(siteConfig.blog.title)} | ${escapeXml(siteConfig.brand.name)}</title>
    <link>${siteConfig.brand.url}/blog</link>
    <description>${escapeXml(siteConfig.blog.metaDescription)}</description>
    <language>en</language>
    <atom:link href="${feedUrl}" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
