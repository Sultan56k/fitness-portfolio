import type { MetadataRoute } from "next";
import { siteConfig } from "@/data/site";
import {
  getAllPosts,
  getAllTags,
  getPostsByTag,
  POSTS_PER_PAGE,
} from "@/lib/blog";

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

  /**
   * Paginated index pages. Page 1 is the bare /blog entry below, so this
   * starts at 2 — listing /blog/page/1 would submit a URL that does not exist.
   * These exist in the sitemap so crawlers can reach older posts even before
   * they have followed the pagination links.
   */
  const pageCount = Math.max(1, Math.ceil(posts.length / POSTS_PER_PAGE));
  const pageEntries: MetadataRoute.Sitemap = Array.from(
    { length: Math.max(0, pageCount - 1) },
    (_, index) => ({
      url: `${siteConfig.brand.url}/blog/page/${index + 2}`,
      changeFrequency: "weekly" as const,
      priority: 0.4,
    }),
  );

  // Each tag's page 1, plus its later pages where the topic has enough posts
  // to need them. Only the busiest few tags contribute more than one entry.
  const tagEntries: MetadataRoute.Sitemap = getAllTags().flatMap((entry) => {
    const tagPages = Math.max(
      1,
      Math.ceil(getPostsByTag(entry.slug).length / POSTS_PER_PAGE),
    );

    return [
      {
        url: `${siteConfig.brand.url}/blog/tag/${entry.slug}`,
        changeFrequency: "weekly" as const,
        priority: 0.5,
      },
      ...Array.from({ length: Math.max(0, tagPages - 1) }, (_, index) => ({
        url: `${siteConfig.brand.url}/blog/tag/${entry.slug}/page/${index + 2}`,
        changeFrequency: "weekly" as const,
        priority: 0.3,
      })),
    ];
  });

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
    ...pageEntries,
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
