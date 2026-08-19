import type { Metadata } from "next";
import { getAllPosts, getAllTags } from "@/lib/blog";
import { siteConfig } from "@/data/site";
import { PostGrid } from "@/components/blog/PostGrid";
import { TagFilter } from "@/components/blog/TagFilter";
import { BlogHeader } from "@/components/blog/BlogHeader";
import { PageViewEvent } from "@/components/analytics/PageViewEvent";

export const metadata: Metadata = {
  // Bare — the root layout's title template appends the brand name.
  title: siteConfig.blog.title,
  description: siteConfig.blog.metaDescription,
  alternates: {
    canonical: "/blog",
    types: { "application/rss+xml": `${siteConfig.brand.url}/blog/rss.xml` },
  },
  openGraph: {
    type: "website",
    url: `${siteConfig.brand.url}/blog`,
    title: `${siteConfig.blog.title} | ${siteConfig.brand.name}`,
    description: siteConfig.blog.metaDescription,
    siteName: siteConfig.brand.name,
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.blog.title} | ${siteConfig.brand.name}`,
    description: siteConfig.blog.metaDescription,
  },
};

/**
 * Blog index. Fully static — the post list comes from the filesystem at build
 * time, so this page is HTML on a CDN with no runtime cost per visitor.
 */
export default function BlogIndexPage() {
  const posts = getAllPosts();
  const tags = getAllTags();

  /**
   * Blog + ItemList structured data. The Blog node tells search engines this
   * URL is a publication rather than a landing page; the ItemList gives it the
   * post ordering explicitly instead of leaving it to be inferred from markup.
   */
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    "@id": `${siteConfig.brand.url}/blog`,
    name: siteConfig.blog.title,
    description: siteConfig.blog.metaDescription,
    url: `${siteConfig.brand.url}/blog`,
    inLanguage: "en",
    publisher: {
      "@type": "Person",
      name: siteConfig.brand.name,
      url: siteConfig.brand.url,
    },
    blogPost: posts.slice(0, 20).map((post) => ({
      "@type": "BlogPosting",
      headline: post.title,
      description: post.excerpt,
      datePublished: post.date,
      dateModified: post.updated ?? post.date,
      url: `${siteConfig.brand.url}/blog/${post.slug}`,
      author: {
        "@type": "Person",
        name: post.author ?? siteConfig.brand.name,
        url: siteConfig.brand.url,
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Carries the catalogue size, so a drop in blog traffic can be read
          against how much there was to land on at the time. */}
      <PageViewEvent event="blog_index_view" props={{ post_count: posts.length }} />

      <div className="section-container py-28 md:py-36">
        <BlogHeader
          label={siteConfig.blog.label}
          title={siteConfig.blog.title}
          subtitle={siteConfig.blog.subtitle}
        />

        <TagFilter tags={tags} />

        <PostGrid posts={posts} featureFirst />
      </div>
    </>
  );
}
