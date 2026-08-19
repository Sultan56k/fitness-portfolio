import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, Clock, RefreshCw } from "lucide-react";
import {
  getAllPosts,
  getPost,
  getRelatedPosts,
  postUrl,
  tagSlug,
} from "@/lib/blog";
import { siteConfig } from "@/data/site";
import { PostCard } from "@/components/blog/PostCard";
import { ArticleCta } from "@/components/blog/ArticleCta";
import { ShareButtons } from "@/components/blog/ShareButtons";
import { PageViewEvent } from "@/components/analytics/PageViewEvent";
import { TableOfContents } from "@/components/blog/TableOfContents";

/**
 * Every post is prerendered at build time from the Markdown on disk.
 */
export function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

/**
 * Only known slugs render. Without this, an unknown `/blog/anything` would be
 * rendered on demand and could return a soft 200 for a page that does not
 * exist — which search engines treat as a duplicate-content signal.
 */
export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) return { title: "Post Not Found" };

  const title = post.seoTitle ?? post.title;
  const description = post.seoDescription ?? post.excerpt;
  // Falls back to the site-wide OG image so a post without artwork still
  // renders a card when shared rather than a bare grey link.
  const image = post.cover ?? "/opengraph-image";

  return {
    // Bare — the root layout's title template appends the brand name.
    title,
    description,
    keywords: post.tags,
    authors: [{ name: post.author ?? siteConfig.brand.name }],
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      type: "article",
      url: postUrl(post.slug),
      title,
      description,
      siteName: siteConfig.brand.name,
      publishedTime: post.date,
      modifiedTime: post.updated ?? post.date,
      authors: [post.author ?? siteConfig.brand.name],
      tags: post.tags,
      images: [{ url: image, width: 1200, height: 630, alt: post.coverAlt ?? title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) notFound();

  const related = getRelatedPosts(post);
  const url = postUrl(post.slug);

  /**
   * BlogPosting + BreadcrumbList. The BlogPosting is what makes the article
   * eligible for article rich results and carries the author, dates, and image
   * that search engines use to attribute and date the content; the breadcrumb
   * replaces the raw URL in the results listing with a readable trail.
   */
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": url,
    headline: post.title,
    description: post.seoDescription ?? post.excerpt,
    datePublished: post.date,
    dateModified: post.updated ?? post.date,
    // Tells search engines this article belongs to the /blog publication node
    // rather than standing alone.
    isPartOf: { "@id": `${siteConfig.brand.url}/blog` },
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    url,
    inLanguage: "en",
    wordCount: post.readingTime * 225,
    keywords: (post.tags ?? []).join(", "),
    image: post.cover
      ? [`${siteConfig.brand.url}${post.cover}`]
      : [`${siteConfig.brand.url}/opengraph-image`],
    author: {
      "@type": "Person",
      name: post.author ?? siteConfig.brand.name,
      url: siteConfig.brand.url,
    },
    publisher: {
      "@type": "Person",
      name: siteConfig.brand.name,
      url: siteConfig.brand.url,
    },
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: siteConfig.brand.url,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Blog",
        item: `${siteConfig.brand.url}/blog`,
      },
      { "@type": "ListItem", position: 3, name: post.title, item: url },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      {/* Dimensions the bare GA page_view cannot carry: which post, which
          funnel bucket, and how long it is — so "which topics earn readers"
          and "do long posts hold them" are answerable without mapping URLs
          back to titles by hand. */}
      <PageViewEvent
        event="blog_post_view"
        props={{
          slug: post.slug,
          title: post.title,
          bucket: post.bucket ?? "none",
          tags: (post.tags ?? []).join(","),
          reading_time: post.readingTime,
        }}
      />

      <article className="section-container py-28 md:py-36">
        {/* Visible breadcrumb, mirroring the JSON-LD above. */}
        <nav aria-label="Breadcrumb" className="mx-auto max-w-3xl">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm font-medium text-accent-lime transition-colors hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            All articles
          </Link>
        </nav>

        <header className="mx-auto mt-8 max-w-3xl">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-text-muted">
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays className="h-4 w-4" aria-hidden="true" />
              <time dateTime={post.date}>{post.formattedDate}</time>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-4 w-4" aria-hidden="true" />
              {post.readingTime} min read
            </span>
            {post.updated && post.updated !== post.date && (
              <span className="inline-flex items-center gap-1.5">
                <RefreshCw className="h-4 w-4" aria-hidden="true" />
                Updated <time dateTime={post.updated}>{post.updated}</time>
              </span>
            )}
          </div>

          <h1 className="mt-4 font-display text-4xl leading-tight tracking-wide text-white md:text-6xl">
            {post.title}
          </h1>

          <p className="mt-5 text-lg leading-relaxed text-text-secondary">
            {post.excerpt}
          </p>

          {(post.tags ?? []).length > 0 && (
            <ul className="mt-6 flex flex-wrap gap-2">
              {(post.tags ?? []).map((tag) => (
                <li key={tag}>
                  <Link
                    href={`/blog/tag/${tagSlug(tag)}`}
                    className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-text-secondary transition-colors hover:border-accent-lime/40 hover:text-accent-lime"
                  >
                    {tag}
                  </Link>
                </li>
              ))}
            </ul>
          )}

          <div className="mt-8 flex items-center gap-3 border-y border-white/8 py-5">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-accent-orange/15 font-display text-lg text-accent-orange">
              {(post.author ?? siteConfig.brand.name).charAt(0)}
            </span>
            <div>
              <p className="text-sm font-semibold text-white">
                {post.author ?? siteConfig.brand.name}
              </p>
              <p className="text-xs text-text-muted">
                Certified Fitness Coach &amp; Nutrition Specialist
              </p>
            </div>
          </div>
        </header>

        {post.cover && (
          <figure className="mx-auto mt-10 max-w-4xl">
            <div className="relative aspect-[16/9] overflow-hidden rounded-2xl border border-white/8">
              <Image
                src={post.cover}
                alt={post.coverAlt ?? post.title}
                fill
                sizes="(max-width: 1024px) 100vw, 896px"
                // The hero image of an article is its LCP element.
                priority
                className="object-cover"
              />
            </div>
          </figure>
        )}

        {/* Contents rail sits in a wider grid than the prose column so the
            article itself keeps a readable measure. */}
        <div className="mx-auto mt-12 grid max-w-6xl gap-12 lg:grid-cols-[minmax(0,1fr)_220px]">
          <div className="mx-auto w-full max-w-3xl lg:mx-0">
            <div
              className="post-prose"
              dangerouslySetInnerHTML={{ __html: post.html }}
            />

            <div className="mt-12 border-t border-white/8 pt-6">
              <ShareButtons url={url} title={post.title} />
            </div>

            <ArticleCta bucket={post.bucket} />
          </div>

          <div className="order-first lg:order-none">
            <TableOfContents headings={post.headings} />
          </div>
        </div>

        {related.length > 0 && (
          <section className="mx-auto mt-20 max-w-6xl" aria-labelledby="related-heading">
            <h2
              id="related-heading"
              className="font-display text-3xl tracking-wide text-white md:text-4xl"
            >
              Keep Reading
            </h2>
            <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((item) => (
                <PostCard key={item.slug} post={item} />
              ))}
            </div>
          </section>
        )}
      </article>
    </>
  );
}
