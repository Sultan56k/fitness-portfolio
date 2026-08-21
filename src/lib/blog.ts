import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings, {
  type Options as AutolinkOptions,
} from "rehype-autolink-headings";
import rehypeStringify from "rehype-stringify";
import { siteConfig } from "@/data/site";

/**
 * File-backed blog. Posts are Markdown files in `content/blog/`, one per
 * article, read at build time — no database, no CMS, and no redeploy pipeline
 * beyond committing a file. Publishing daily is `git add` on one `.md`.
 *
 * Everything here runs on the server only (it touches `node:fs`), so these
 * helpers must never be imported into a `"use client"` component.
 */

export const BLOG_DIR = path.join(process.cwd(), "content", "blog");

/**
 * Funnel buckets from the content calendar. Each article pushes toward one
 * service, and its closing CTA is chosen from this.
 */
export const BUCKETS = ["DIET", "STRENGTH", "CONSULT", "APP"] as const;

export type Bucket = (typeof BUCKETS)[number];

export function isBucket(value: unknown): value is Bucket {
  return typeof value === "string" && (BUCKETS as readonly string[]).includes(value);
}

/** Frontmatter contract. `title`, `date`, and `excerpt` are required. */
export interface PostFrontmatter {
  title: string;
  /** ISO `YYYY-MM-DD`. Drives ordering, and the `datePublished` in JSON-LD. */
  date: string;
  /** 1–2 sentences. Doubles as the meta description and the card summary. */
  excerpt: string;
  /** Free-form topics. Each becomes a filterable tag page. */
  tags?: string[];
  /**
   * Funnel bucket — decides which CTA closes the article. Omitting it falls
   * back to the generic consultation block, which converts less well, so set
   * it on every post.
   */
  bucket?: Bucket;
  /** Path under /public, e.g. "/images/blog/protein.jpg". */
  cover?: string;
  /** Alt text for the cover. Falls back to the title. */
  coverAlt?: string;
  /** Overrides the site author for guest posts. */
  author?: string;
  /** Set false to keep a file in the repo without publishing it. */
  published?: boolean;
  /** Set when materially revised, so search engines see a fresh signal. */
  updated?: string;
  /** Overrides the auto-generated <title>, for keyword-tuned titles. */
  seoTitle?: string;
  /** Overrides `excerpt` as the meta description when a longer one is wanted. */
  seoDescription?: string;
}

export interface PostMeta extends PostFrontmatter {
  slug: string;
  /** Whole minutes, floor 1. */
  readingTime: number;
  /** Long-form display date, e.g. "19 August 2026". */
  formattedDate: string;
}

export interface Post extends PostMeta {
  /** Rendered HTML body. */
  html: string;
  /** `##` and `###` headings, for the in-article table of contents. */
  headings: { id: string; text: string; level: number }[];
}

/** Words per minute used for the reading estimate. */
const WPM = 225;

/**
 * Turns a tag into its URL segment. Lowercased and hyphenated so "Fat Loss"
 * and "fat-loss" resolve to the same page rather than two competing ones.
 */
export function tagSlug(tag: string): string {
  return tag
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Dates are formatted in a fixed locale and time zone. Both matter: the value
 * is rendered on the server and hydrated in the browser, and a visitor-local
 * format or zone would shift the string (or the day) and trip a hydration
 * mismatch.
 */
function formatDate(iso: string): string {
  const parsed = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime())) return iso;
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(parsed);
}

function readingTimeOf(markdown: string): number {
  const words = markdown.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / WPM));
}

/** Strips inline Markdown so heading text reads cleanly in the contents list. */
function plainText(value: string): string {
  return value
    .replace(/`([^`]*)`/g, "$1")
    .replace(/\*\*([^*]*)\*\*/g, "$1")
    .replace(/\*([^*]*)\*/g, "$1")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .trim();
}

/**
 * Mirrors rehype-slug's GitHub-style slugging, so the ids in the contents list
 * match the ids rehype-slug writes onto the rendered headings.
 */
function headingId(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .trim()
    .replace(/\s+/g, "-");
}

function extractHeadings(markdown: string) {
  const headings: { id: string; text: string; level: number }[] = [];
  let inFence = false;

  for (const line of markdown.split("\n")) {
    // Headings inside fenced code blocks are code, not structure.
    if (/^\s*(```|~~~)/.test(line)) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;

    const match = /^(#{2,3})\s+(.*)$/.exec(line);
    if (!match) continue;

    const text = plainText(match[2]);
    headings.push({ id: headingId(text), text, level: match[1].length });
  }

  return headings;
}

/**
 * True for files this module treats as posts.
 *
 * Excluded: `_`-prefixed files (the template), and SCREAMING-CASE filenames
 * like README.md and AUTOMATION.md. The latter is a convention rather than a
 * list, so documentation added to this folder later is excluded automatically
 * — post slugs are lowercase anyway, since the filename becomes the URL.
 */
function isPostFile(filename: string): boolean {
  const base = filename.replace(/\.mdx?$/, "");

  return (
    /\.mdx?$/.test(filename) &&
    !filename.startsWith("_") &&
    !/^[A-Z0-9_-]+$/.test(base)
  );
}

/**
 * Returns null rather than throwing when a file is malformed. One post with a
 * bad date should not take the whole index — and the build — down with it; the
 * warning surfaces it in the build log instead.
 */
function parseFile(filename: string): PostMeta | null {
  const raw = fs.readFileSync(path.join(BLOG_DIR, filename), "utf8");
  const { data, content } = matter(raw);
  const front = data as Partial<PostFrontmatter>;
  const slug = filename.replace(/\.mdx?$/, "");

  if (!front.title || !front.date) {
    console.warn(`[blog] Skipping "${filename}": missing title or date.`);
    return null;
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(front.date)) {
    console.warn(`[blog] Skipping "${filename}": date must be YYYY-MM-DD.`);
    return null;
  }

  /**
   * A misspelled bucket ("Diet", "NUTRITION") would otherwise fall through to
   * the generic CTA silently — the post would look fine while quietly pushing
   * the wrong offer. Warn and drop it instead.
   */
  if (front.bucket !== undefined && !isBucket(front.bucket)) {
    console.warn(
      `[blog] "${filename}": unknown bucket "${front.bucket}". ` +
        `Expected one of ${BUCKETS.join(", ")}. Using the default CTA.`,
    );
  }

  return {
    ...(front as PostFrontmatter),
    slug,
    excerpt: front.excerpt ?? "",
    tags: front.tags ?? [],
    bucket: isBucket(front.bucket) ? front.bucket : undefined,
    readingTime: readingTimeOf(content),
    formattedDate: formatDate(front.date),
  };
}

/**
 * Every published post, newest first. `published: false` hides a draft, and a
 * future-dated post stays hidden until that date arrives — so a week of posts
 * can be committed at once and released one per day.
 */
export function getAllPosts(): PostMeta[] {
  if (!fs.existsSync(BLOG_DIR)) return [];

  // Compared as date-only strings, matching the frontmatter format, so a post
  // dated today is live from the start of the day in any time zone.
  const today = new Date().toISOString().slice(0, 10);

  return fs
    .readdirSync(BLOG_DIR)
    .filter(isPostFile)
    .map(parseFile)
    .filter((post): post is PostMeta => post !== null)
    .filter((post) => post.published !== false && post.date <= today)
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
}

/**
 * Wraps each heading's text in an anchor to its own id, so any section of an
 * article can be linked to directly.
 */
const autolinkOptions: AutolinkOptions = {
  behavior: "wrap",
  properties: { className: ["heading-anchor"] },
};

/** Renders one post to HTML. Returns null when the slug does not exist. */
export async function getPost(slug: string): Promise<Post | null> {
  const meta = getAllPosts().find((post) => post.slug === slug);
  if (!meta) return null;

  const filename = [`${slug}.md`, `${slug}.mdx`].find((name) =>
    fs.existsSync(path.join(BLOG_DIR, name)),
  );
  if (!filename) return null;

  const { content } = matter(fs.readFileSync(path.join(BLOG_DIR, filename), "utf8"));

  const file = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    // Author content is ours, committed to the repo — not visitor input — so
    // raw HTML in a post is trusted and passed through.
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeSlug)
    // Heading anchors: a linkable id per section, which also gives the
    // contents list something to jump to.
    //
    // Annotated rather than passed inline: `unified().use()` is overloaded and
    // the first candidate signature takes a bare boolean, so an inline literal
    // is checked against that overload and rejected before the options one is
    // reached. Naming the type picks the right overload.
    .use(rehypeAutolinkHeadings, autolinkOptions)
    .use(rehypeStringify, { allowDangerousHtml: true })
    .process(content);

  return {
    ...meta,
    html: String(file),
    headings: extractHeadings(content),
  };
}

/** Every tag in use, with post counts, most-used first. */
export function getAllTags(): { tag: string; slug: string; count: number }[] {
  const counts = new Map<string, { tag: string; count: number }>();

  for (const post of getAllPosts()) {
    for (const tag of post.tags ?? []) {
      const key = tagSlug(tag);
      const existing = counts.get(key);
      // First spelling seen wins the display casing, so "nutrition" in a later
      // post does not overwrite the "Nutrition" already shown in the filter.
      if (existing) existing.count += 1;
      else counts.set(key, { tag, count: 1 });
    }
  }

  return [...counts.entries()]
    .map(([slug, value]) => ({ slug, ...value }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
}

export function getPostsByTag(slug: string): PostMeta[] {
  return getAllPosts().filter((post) =>
    (post.tags ?? []).some((tag) => tagSlug(tag) === slug),
  );
}

/**
 * Up to `limit` posts to read next: those sharing the most tags with the
 * current post, then the most recent, so an article always has a next step
 * even before the archive is large enough for real overlap.
 */
export function getRelatedPosts(current: PostMeta, limit = 3): PostMeta[] {
  const currentTags = new Set((current.tags ?? []).map(tagSlug));

  return getAllPosts()
    .filter((post) => post.slug !== current.slug)
    .map((post) => ({
      post,
      shared: (post.tags ?? []).filter((tag) => currentTags.has(tagSlug(tag)))
        .length,
    }))
    .sort((a, b) => b.shared - a.shared || (a.post.date < b.post.date ? 1 : -1))
    .slice(0, limit)
    .map((entry) => entry.post);
}

/** Absolute canonical URL for a post. */
export function postUrl(slug: string): string {
  return `${siteConfig.brand.url}/blog/${slug}`;
}

/**
 * Posts per listing page.
 *
 * 9 divides evenly by the 3-column grid, so no page ends in a ragged row of
 * one. On the unfiltered index the newest post renders wide above the grid,
 * which leaves 8 in the grid there — deliberate, since the feature card is
 * doing the work a third column would.
 */
export const POSTS_PER_PAGE = 9;

export interface Paginated<T> {
  items: T[];
  /** 1-based. */
  page: number;
  totalPages: number;
  totalItems: number;
  hasPrev: boolean;
  hasNext: boolean;
}

/**
 * Slices a post list for one page.
 *
 * Always reports at least one page so an empty blog still renders a valid
 * (empty) page 1 rather than "page 1 of 0".
 */
export function paginate<T>(items: T[], page: number): Paginated<T> {
  const totalItems = items.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / POSTS_PER_PAGE));
  // Clamped rather than trusted: `page` comes from the URL.
  const current = Math.min(Math.max(1, page), totalPages);
  const start = (current - 1) * POSTS_PER_PAGE;

  return {
    items: items.slice(start, start + POSTS_PER_PAGE),
    page: current,
    totalPages,
    totalItems,
    hasPrev: current > 1,
    hasNext: current < totalPages,
  };
}

/**
 * Page numbers to render, with `null` marking a gap ("…").
 *
 * Always shows first and last so the ends of the archive stay one click away,
 * plus a window around the current page. Without the ellipsis a blog with 40
 * pages would render 40 links and wrap across several lines on a phone.
 */
export function pageNumbers(current: number, total: number): (number | null)[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages = new Set<number>([1, total, current]);
  if (current > 1) pages.add(current - 1);
  if (current < total) pages.add(current + 1);
  // Keeps the bar a stable width at the ends, where the window is one-sided.
  if (current <= 3) [2, 3, 4].forEach((n) => pages.add(n));
  if (current >= total - 2) [total - 3, total - 2, total - 1].forEach((n) => pages.add(n));

  const sorted = [...pages].filter((n) => n >= 1 && n <= total).sort((a, b) => a - b);

  const result: (number | null)[] = [];
  let previous = 0;
  for (const page of sorted) {
    if (previous && page - previous > 1) result.push(null);
    result.push(page);
    previous = page;
  }
  return result;
}
