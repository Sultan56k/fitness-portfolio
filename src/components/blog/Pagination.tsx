import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { pageNumbers } from "@/lib/blog";
import { cn } from "@/lib/utils";

/**
 * Pagination bar for the blog listings.
 *
 * Real links to real URLs rather than client-side state: each page is a
 * separate indexable document, the browser Back button works, and a visitor
 * can share or bookmark page 3. Client-side "load more" would collapse the
 * archive into one URL and hide the older posts from search entirely.
 *
 * Renders nothing on a single-page blog — a bar reading "1" is noise.
 */
export function Pagination({
  page,
  totalPages,
  /** Page 1's URL, e.g. "/blog" or "/blog/tag/nutrition". */
  basePath,
}: {
  page: number;
  totalPages: number;
  basePath: string;
}) {
  if (totalPages <= 1) return null;

  /**
   * Page 1 lives at the bare path, not `/page/1`. Two URLs serving identical
   * content is a duplicate-content problem, and the bare path is the canonical
   * one that already carries links.
   */
  const hrefFor = (n: number) => (n === 1 ? basePath : `${basePath}/page/${n}`);

  const base =
    "inline-flex h-10 min-w-10 items-center justify-center rounded-full border px-3 text-sm font-medium transition-colors duration-200";
  const inactive =
    "border-white/10 bg-white/5 text-text-secondary hover:border-white/25 hover:text-white";
  const disabled = "border-white/5 text-text-muted/50 cursor-not-allowed";

  return (
    <nav
      aria-label="Blog pagination"
      className="mt-14 flex flex-col items-center gap-4"
    >
      <ul className="flex flex-wrap items-center justify-center gap-2">
        <li>
          {page > 1 ? (
            <Link
              href={hrefFor(page - 1)}
              rel="prev"
              aria-label="Previous page"
              className={cn(base, inactive)}
            >
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            </Link>
          ) : (
            // Rendered as a span, not a disabled link: there is no previous
            // page to point at, and a link to nowhere is worse than no link.
            <span aria-hidden="true" className={cn(base, disabled)}>
              <ChevronLeft className="h-4 w-4" />
            </span>
          )}
        </li>

        {pageNumbers(page, totalPages).map((n, index) =>
          n === null ? (
            <li key={`gap-${index}`}>
              <span className="px-1 text-text-muted" aria-hidden="true">
                …
              </span>
            </li>
          ) : (
            <li key={n}>
              <Link
                href={hrefFor(n)}
                aria-label={`Page ${n}`}
                aria-current={n === page ? "page" : undefined}
                className={cn(
                  base,
                  n === page
                    ? "border-accent-orange bg-accent-orange text-white"
                    : inactive,
                )}
              >
                {n}
              </Link>
            </li>
          ),
        )}

        <li>
          {page < totalPages ? (
            <Link
              href={hrefFor(page + 1)}
              rel="next"
              aria-label="Next page"
              className={cn(base, inactive)}
            >
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          ) : (
            <span aria-hidden="true" className={cn(base, disabled)}>
              <ChevronRight className="h-4 w-4" />
            </span>
          )}
        </li>
      </ul>

      <p className="text-sm text-text-muted">
        Page {page} of {totalPages}
      </p>
    </nav>
  );
}
