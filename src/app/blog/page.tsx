import type { Metadata } from "next";
import { siteConfig } from "@/data/site";
import { BlogIndex } from "@/components/blog/BlogIndex";

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
 * Blog index, page 1. Later pages live at `/blog/page/[page]` and render the
 * same component. Fully static — the post list comes from the filesystem at
 * build time, so this is HTML on a CDN with no runtime cost per visitor.
 */
export default function BlogIndexPage() {
  return <BlogIndex page={1} />;
}
