import Link from "next/link";
import { PenLine } from "lucide-react";
import { PostCard } from "./PostCard";
import type { PostMeta } from "@/lib/blog";
import { siteConfig } from "@/data/site";

/**
 * The post listing, shared by /blog and the tag pages so both stay identical
 * as the design evolves.
 *
 * The newest post renders wide only on the unfiltered index. On a tag page the
 * "latest" post is latest-within-a-topic, which is not a meaningful enough
 * distinction to earn double the visual weight.
 */
export function PostGrid({
  posts,
  featureFirst = false,
  emptyMessage,
}: {
  posts: PostMeta[];
  featureFirst?: boolean;
  emptyMessage?: string;
}) {
  if (posts.length === 0) {
    return (
      <div className="glass-panel mt-12 flex flex-col items-center px-6 py-16 text-center">
        <PenLine className="h-8 w-8 text-accent-lime" aria-hidden="true" />
        <p className="mt-4 max-w-md text-text-secondary">
          {emptyMessage ?? siteConfig.blog.emptyState}
        </p>
        <Link
          href={siteConfig.social.instagram}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 text-sm font-semibold text-accent-lime underline underline-offset-4 hover:text-white"
        >
          Follow {siteConfig.social.instagramHandle}
        </Link>
      </div>
    );
  }

  const [first, ...rest] = posts;
  const showFeature = featureFirst && posts.length > 1;

  return (
    <div className="mt-12 space-y-8">
      {showFeature && <PostCard post={first} featured />}

      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {(showFeature ? rest : posts).map((post) => (
          <PostCard key={post.slug} post={post} />
        ))}
      </div>
    </div>
  );
}
