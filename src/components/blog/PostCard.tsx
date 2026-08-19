import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, CalendarDays, Clock } from "lucide-react";
import type { PostMeta } from "@/lib/blog";
import { cn } from "@/lib/utils";

/**
 * One post in a listing grid. Server component — a card is a link and some
 * text, and the hover states are pure CSS, so none of this needs to ship JS.
 *
 * The whole card is one link (via the stretched overlay on the title) rather
 * than several: a card with separate title, image, and "read more" links is
 * three identical destinations for a screen reader to announce, and a wider
 * target is easier to hit on a phone.
 */
export function PostCard({
  post,
  featured = false,
}: {
  post: PostMeta;
  /** Renders wide, with a larger image — used for the newest post. */
  featured?: boolean;
}) {
  return (
    <article
      className={cn(
        "glass-panel group relative flex flex-col overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:border-accent-lime/30",
        featured && "md:flex-row",
      )}
    >
      <div
        className={cn(
          "relative overflow-hidden bg-bg-elevated",
          featured ? "aspect-[16/10] md:aspect-auto md:w-1/2" : "aspect-[16/10]",
        )}
      >
        {post.cover ? (
          <Image
            src={post.cover}
            alt={post.coverAlt ?? post.title}
            fill
            // Featured spans half the 1280px container; the grid cards are a
            // third of it. Getting this wrong is the usual cause of a blog
            // shipping 2000px images to a phone.
            sizes={
              featured
                ? "(max-width: 768px) 100vw, 640px"
                : "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 400px"
            }
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            // The newest post is above the fold on /blog, so its image is the
            // likely LCP element and should not wait for the lazy observer.
            priority={featured}
          />
        ) : (
          // Placeholder rather than a collapsed card, so a post published
          // without artwork still sits correctly in the grid.
          <div
            className="hero-backdrop h-full w-full"
            aria-hidden="true"
          />
        )}
      </div>

      <div
        className={cn(
          "flex flex-1 flex-col p-6",
          featured && "md:justify-center md:p-8",
        )}
      >
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-text-muted">
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
            <time dateTime={post.date}>{post.formattedDate}</time>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" aria-hidden="true" />
            {post.readingTime} min read
          </span>
        </div>

        <h3
          className={cn(
            "mt-3 font-display tracking-wide text-white transition-colors group-hover:text-accent-lime",
            featured ? "text-3xl md:text-4xl" : "text-2xl",
          )}
        >
          {/* `after:absolute inset-0` stretches this link over the whole card. */}
          <Link href={`/blog/${post.slug}`} className="after:absolute after:inset-0">
            {post.title}
          </Link>
        </h3>

        <p
          className={cn(
            "mt-3 leading-relaxed text-text-secondary",
            featured ? "text-base" : "line-clamp-3 text-sm",
          )}
        >
          {post.excerpt}
        </p>

        <div className="mt-5 flex flex-wrap items-center gap-2">
          {(post.tags ?? []).slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-text-secondary"
            >
              {tag}
            </span>
          ))}
        </div>

        <span className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-accent-lime">
          Read article
          <ArrowUpRight
            className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            aria-hidden="true"
          />
        </span>
      </div>
    </article>
  );
}
