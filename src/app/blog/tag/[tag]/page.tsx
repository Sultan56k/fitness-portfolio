import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getAllTags, getPostsByTag } from "@/lib/blog";
import { siteConfig } from "@/data/site";
import { PostGrid } from "@/components/blog/PostGrid";
import { TagFilter } from "@/components/blog/TagFilter";
import { BlogHeader } from "@/components/blog/BlogHeader";

export function generateStaticParams() {
  return getAllTags().map((entry) => ({ tag: entry.slug }));
}

export const dynamicParams = false;

/** The display name for a slug, from the tag index. */
function resolveTag(slug: string) {
  return getAllTags().find((entry) => entry.slug === slug);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tag: string }>;
}): Promise<Metadata> {
  const { tag } = await params;
  const entry = resolveTag(tag);

  if (!entry) return { title: "Topic Not Found" };

  // `title` is bare — the root layout's template appends the brand name. The
  // OG/Twitter fields below are not templated, so they carry it explicitly.
  const title = `${entry.tag} Articles`;
  const socialTitle = `${title} | ${siteConfig.brand.name}`;
  const description = `${entry.count} ${
    entry.count === 1 ? "article" : "articles"
  } on ${entry.tag.toLowerCase()} — practical fitness and nutrition guidance from certified coach ${siteConfig.brand.name}.`;

  return {
    title,
    description,
    alternates: { canonical: `/blog/tag/${entry.slug}` },
    openGraph: {
      type: "website",
      url: `${siteConfig.brand.url}/blog/tag/${entry.slug}`,
      title: socialTitle,
      description,
      siteName: siteConfig.brand.name,
    },
    twitter: { card: "summary_large_image", title: socialTitle, description },
  };
}

/**
 * One page per topic. These exist to rank: a visitor searching "fat loss
 * advice" should be able to land on a page that is entirely about fat loss,
 * rather than on a mixed index where the topic is one card among twenty.
 */
export default async function BlogTagPage({
  params,
}: {
  params: Promise<{ tag: string }>;
}) {
  const { tag } = await params;
  const entry = resolveTag(tag);

  if (!entry) notFound();

  const posts = getPostsByTag(entry.slug);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${entry.tag} Articles`,
    url: `${siteConfig.brand.url}/blog/tag/${entry.slug}`,
    isPartOf: { "@id": `${siteConfig.brand.url}/blog` },
    inLanguage: "en",
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: posts.length,
      itemListElement: posts.map((post, index) => ({
        "@type": "ListItem",
        position: index + 1,
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
            subtitle={`${entry.count} ${
              entry.count === 1 ? "article" : "articles"
            } on ${entry.tag.toLowerCase()}.`}
          />
        </div>

        <TagFilter tags={getAllTags()} activeSlug={entry.slug} />

        <PostGrid
          posts={posts}
          emptyMessage={`No articles filed under ${entry.tag} yet.`}
        />
      </div>
    </>
  );
}
