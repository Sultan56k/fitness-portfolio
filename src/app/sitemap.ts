import type { MetadataRoute } from "next";
import { siteConfig } from "@/data/site";
import { getAllPosts, getAllTags } from "@/lib/blog";

/**
 * Every route is enumerated here, and the blog entries are derived from the
 * Markdown on disk rather than listed by hand — so publishing a post adds it to
 * the sitemap with no second edit to remember.
 *
 * `lastModified` on a post is its `updated` date if it has one, otherwise its
 * publication date. It must never be "now": a sitemap that reports every page
 * as freshly modified on every build teaches crawlers to ignore the field.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getAllPosts();

  const postEntries: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${siteConfig.brand.url}/blog/${post.slug}`,
    lastModified: new Date(`${post.updated ?? post.date}T00:00:00Z`),
    // Articles are edited rarely after publication; the index below is what
    // changes daily.
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const tagEntries: MetadataRoute.Sitemap = getAllTags().map((entry) => ({
    url: `${siteConfig.brand.url}/blog/tag/${entry.slug}`,
    changeFrequency: "weekly",
    priority: 0.5,
  }));

  return [
    {
      url: siteConfig.brand.url,
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: `${siteConfig.brand.url}/blog`,
      // The newest post's date — the index genuinely changed when it landed.
      lastModified: posts[0]
        ? new Date(`${posts[0].date}T00:00:00Z`)
        : undefined,
      changeFrequency: "daily",
      priority: 0.9,
    },
    ...postEntries,
    ...tagEntries,
    {
      url: `${siteConfig.brand.url}/privacy`,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${siteConfig.brand.url}/terms`,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];
}
