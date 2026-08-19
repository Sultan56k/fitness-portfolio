import Link from "next/link";
import { siteConfig } from "@/data/site";
import { cn } from "@/lib/utils";

/**
 * Topic filter above the post grid.
 *
 * Real links to real routes rather than client-side state: each tag page is a
 * separate indexable URL that can rank for its own topic ("fat loss articles"),
 * which is the entire SEO argument for having tags at all. Client-side
 * filtering would collapse them into one page and forfeit that.
 */
export function TagFilter({
  tags,
  /** Slug of the active tag, or undefined on the unfiltered index. */
  activeSlug,
}: {
  tags: { tag: string; slug: string; count: number }[];
  activeSlug?: string;
}) {
  if (tags.length === 0) return null;

  const pill =
    "rounded-full border px-4 py-2 text-sm font-medium transition-colors duration-200";

  return (
    <nav aria-label="Filter articles by topic" className="mt-10">
      <ul className="flex flex-wrap justify-center gap-2.5">
        <li>
          <Link
            href="/blog"
            aria-current={activeSlug ? undefined : "page"}
            className={cn(
              pill,
              activeSlug
                ? "border-white/10 bg-white/5 text-text-secondary hover:border-white/25 hover:text-white"
                : "border-accent-orange bg-accent-orange text-white",
            )}
          >
            {siteConfig.blog.allTagsLabel}
          </Link>
        </li>

        {tags.map((entry) => {
          const isActive = entry.slug === activeSlug;

          return (
            <li key={entry.slug}>
              <Link
                href={`/blog/tag/${entry.slug}`}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  pill,
                  isActive
                    ? "border-accent-orange bg-accent-orange text-white"
                    : "border-white/10 bg-white/5 text-text-secondary hover:border-white/25 hover:text-white",
                )}
              >
                {entry.tag}
                <span
                  className={cn(
                    "ml-2 text-xs",
                    isActive ? "text-white/70" : "text-text-muted",
                  )}
                >
                  {entry.count}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
