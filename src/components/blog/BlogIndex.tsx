import { getAllPosts, getAllTags, paginate } from "@/lib/blog";
import { siteConfig } from "@/data/site";
import { PostGrid } from "@/components/blog/PostGrid";
import { TagFilter } from "@/components/blog/TagFilter";
import { BlogHeader } from "@/components/blog/BlogHeader";
import { Pagination } from "@/components/blog/Pagination";
import { PageViewEvent } from "@/components/analytics/PageViewEvent";

/**
 * The blog index, shared by `/blog` and `/blog/page/[page]` so the two cannot
 * drift apart. Page 1 is served from the bare `/blog` path; `/blog/page/1`
 * does not exist, which keeps one canonical URL per page of results.
 */
export function BlogIndex({ page }: { page: number }) {
  const allPosts = getAllPosts();
  const tags = getAllTags();
  const result = paginate(allPosts, page);

  /**
   * Blog + BlogPosting structured data. Only the posts on this page are
   * listed: claiming all 30 on every page would misdescribe the document and
   * duplicate the same entities across four URLs.
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
    blogPost: result.items.map((post) => ({
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
      <PageViewEvent
        event="blog_index_view"
        props={{ post_count: result.totalItems, page: result.page }}
      />

      <div className="section-container py-28 md:py-36">
        <BlogHeader
          label={siteConfig.blog.label}
          title={siteConfig.blog.title}
          // Page 2 onward is an archive view rather than a front page, so the
          // marketing subtitle is replaced with a plain position indicator.
          subtitle={
            result.page === 1
              ? siteConfig.blog.subtitle
              : `Page ${result.page} of ${result.totalPages} — ${result.totalItems} articles in total.`
          }
        />

        <TagFilter tags={tags} />

        {/* The wide feature card is a front-page device. On later pages the
            first post is simply the next one chronologically. */}
        <PostGrid posts={result.items} featureFirst={result.page === 1} />

        <Pagination
          page={result.page}
          totalPages={result.totalPages}
          basePath="/blog"
        />
      </div>
    </>
  );
}
