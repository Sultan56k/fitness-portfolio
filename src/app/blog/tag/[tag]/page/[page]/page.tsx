import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllTags, getPostsByTag, POSTS_PER_PAGE } from "@/lib/blog";
import { siteConfig } from "@/data/site";
import { TagIndex } from "@/components/blog/TagIndex";

/**
 * A topic archive, pages 2..n. Only the two or three busiest tags ever reach
 * a second page; the rest generate nothing here, which is why this route is
 * built from the real counts rather than a fixed range.
 */
function pagesFor(slug: string): number {
  return Math.max(1, Math.ceil(getPostsByTag(slug).length / POSTS_PER_PAGE));
}

export function generateStaticParams() {
  return getAllTags().flatMap((entry) => {
    const total = pagesFor(entry.slug);
    // Starts at 2 — page 1 is the bare tag path.
    return Array.from({ length: Math.max(0, total - 1) }, (_, i) => ({
      tag: entry.slug,
      page: String(i + 2),
    }));
  });
}

export const dynamicParams = false;

function resolve(tagSlugValue: string, pageValue: string) {
  const entry = getAllTags().find((t) => t.slug === tagSlugValue);
  if (!entry) return null;

  // Rejects "01", "2.5", "-1" — each would be a second URL for the same page.
  if (!/^[1-9]\d*$/.test(pageValue)) return null;
  const page = Number(pageValue);
  if (page < 2 || page > pagesFor(entry.slug)) return null;

  return { entry, page };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tag: string; page: string }>;
}): Promise<Metadata> {
  const { tag, page } = await params;
  const resolved = resolve(tag, page);
  if (!resolved) return { title: "Page Not Found" };

  const total = pagesFor(resolved.entry.slug);
  const title = `${resolved.entry.tag} Articles — Page ${resolved.page}`;
  const description = `Page ${resolved.page} of ${total} — more ${resolved.entry.tag.toLowerCase()} articles from ${siteConfig.brand.name}.`;

  return {
    title,
    description,
    alternates: {
      canonical: `/blog/tag/${resolved.entry.slug}/page/${resolved.page}`,
    },
    openGraph: {
      type: "website",
      url: `${siteConfig.brand.url}/blog/tag/${resolved.entry.slug}/page/${resolved.page}`,
      title: `${title} | ${siteConfig.brand.name}`,
      description,
      siteName: siteConfig.brand.name,
    },
    robots: { index: true, follow: true },
  };
}

export default async function BlogTagPaginatedPage({
  params,
}: {
  params: Promise<{ tag: string; page: string }>;
}) {
  const { tag, page } = await params;
  const resolved = resolve(tag, page);
  if (!resolved) notFound();

  return <TagIndex entry={resolved.entry} page={resolved.page} />;
}
