import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getAllTags, getPostsByTag, paginate } from "@/lib/blog";
import { siteConfig } from "@/data/site";
import { PostGrid } from "@/components/blog/PostGrid";
import { TagFilter } from "@/components/blog/TagFilter";
import { BlogHeader } from "@/components/blog/BlogHeader";
import { Pagination } from "@/components/blog/Pagination";

/**
 * One topic's archive, shared by `/blog/tag/[tag]` and its paginated pages so
 * the two cannot drift apart. As with the main index, page 1 is served from
 * the bare tag path rather than `/page/1`.
 */
export function TagIndex({
  entry,
  page,
}: {
  entry: { tag: string; slug: string; count: number };
  page: number;
}) {
  const result = paginate(getPostsByTag(entry.slug), page);
  const basePath = `/blog/tag/${entry.slug}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${entry.tag} Articles`,
    url: `${siteConfig.brand.url}${basePath}`,
    isPartOf: { "@id": `${siteConfig.brand.url}/blog` },
    inLanguage: "en",
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: result.totalItems,
      // Positions continue across pages rather than restarting at 1, so the
      // list describes the whole topic rather than this slice of it.
      itemListElement: result.items.map((post, index) => ({
        "@type": "ListItem",
        position: (result.page - 1) * 9 + index + 1,
        name: post.title,
        url: `${siteConfig.brand.url}/blog/${post.slug}`,
      })),
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="section-container py-28 md:py-36">
        <nav aria-label="Breadcrumb" className="mx-auto max-w-3xl text-center">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm font-medium text-accent-lime transition-colors hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            All articles
          </Link>
        </nav>

        <div className="mt-8">
          <BlogHeader
            label="Topic"
            title={entry.tag}
            subtitle={
              result.totalPages > 1
                ? `${result.totalItems} articles on ${entry.tag.toLowerCase()} — page ${result.page} of ${result.totalPages}.`
                : `${result.totalItems} ${
                    result.totalItems === 1 ? "article" : "articles"
                  } on ${entry.tag.toLowerCase()}.`
            }
          />
        </div>

        <TagFilter tags={getAllTags()} activeSlug={entry.slug} />

        <PostGrid
          posts={result.items}
          emptyMessage={`No articles filed under ${entry.tag} yet.`}
        />

        <Pagination
          page={result.page}
          totalPages={result.totalPages}
          basePath={basePath}
        />
      </div>
    </>
  );
}
