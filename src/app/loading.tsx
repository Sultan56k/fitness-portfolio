import { siteConfig } from "@/data/site";

/**
 * Route-level loading state. Shown while a route segment streams in — most
 * visibly when navigating to /privacy or /terms.
 *
 * Uses the brand monogram and a CSS-only pulse rather than a spinner, so it
 * reads as part of the site rather than a generic loader, and needs no JS.
 */
export default function Loading() {
  return (
    <div
      className="flex min-h-[70vh] flex-col items-center justify-center gap-4"
      role="status"
      aria-live="polite"
    >
      <div className="relative flex h-16 w-16 items-center justify-center">
        <span
          className="absolute inset-0 rounded-full border border-accent-lime/40 animate-pulse-ring"
          aria-hidden="true"
        />
        <span className="font-display text-3xl tracking-wide text-accent-lime">
          {siteConfig.brand.name.charAt(0)}
        </span>
      </div>
      <p className="text-sm text-text-muted">Loading…</p>
      <span className="sr-only">Loading page content</span>
    </div>
  );
}
