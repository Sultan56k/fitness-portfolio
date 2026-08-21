import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllPosts, POSTS_PER_PAGE } from "@/lib/blog";
import { siteConfig } from "@/data/site";
import { BlogIndex } from "@/components/blog/BlogIndex";

/**
 * Blog index, pages 2..n.
 *
 * Page 1 is deliberately absent: it is served by `/blog`, and generating
 * `/blog/page/1` as well would put identical content on two URLs. Anything
 * outside the real range 404s rather than rendering an empty grid, so a stale
 * or mistyped link is an honest error instead of a soft 200.
 */
function totalPages(): number {
  return Math.max(1, Math.ceil(getAllPosts().length / POSTS_PER_PAGE));
}

export function generateStaticParams() {
  const total = totalPages();
  // Starts at 2 — see above.
  return Array.from({ length: Math.max(0, total - 1) }, (_, i) => ({
    page: String(i + 2),
  }));
}

export const dynamicParams = false;

/** Parses the segment, returning null for anything that is not a real page. */
function parsePage(value: string): number | null {
  // Rejects "01", "2.5", "-1", "abc" — each of which would otherwise be a
  // second URL serving the same content as a valid page.
  if (!/^[1-9]\d*$/.test(value)) return null;
  const page = Number(value);
  if (page < 2 || page > totalPages()) return null;
  return page;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ page: string }>;
}): Promise<Metadata> {
  const page = parsePage((await params).page);
  if (!page) return { title: "Page Not Found" };

  const total = totalPages();
  const title = `${siteConfig.blog.title} — Page ${page}`;

  return {
    title,
    // Distinct from page 1's description: identical meta descriptions across
    // paginated URLs is a duplicate-content signal.
    description: `Page ${page} of ${total} — more fitness and nutrition articles from ${siteConfig.brand.name}.`,
    alternates: { canonical: `/blog/page/${page}` },
    openGraph: {
      type: "website",
      url: `${siteConfig.brand.url}/blog/page/${page}`,
      title: `${title} | ${siteConfig.brand.name}`,
      description: `Page ${page} of ${total} of the ${siteConfig.brand.name} blog.`,
      siteName: siteConfig.brand.name,
    },
    /**
     * Indexed but not competing: these pages exist so crawlers can reach older
     * posts, which is why `follow` matters. `index` stays on so the archive is
     * discoverable, and the distinct titles above keep them from duplicating
     * page 1.
     */
    robots: { index: true, follow: true },
  };
}

export default async function BlogPaginatedPage({
  params,
}: {
  params: Promise<{ page: string }>;
}) {
  const page = parsePage((await params).page);
  if (!page) notFound();

  return <BlogIndex page={page} />;
}
