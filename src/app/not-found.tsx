import type { Metadata } from "next";
import Link from "next/link";
import { siteConfig } from "@/data/site";

export const metadata: Metadata = {
  // Bare — the root layout's title template appends the brand name.
  title: siteConfig.notFound.title,
  // A 404 must never be indexed — it would compete with the real pages.
  robots: { index: false, follow: true },
};

/**
 * Custom 404. The site previously fell through to the bare Next.js default,
 * which is unstyled, unbranded, and offers no route back into the funnel.
 */
export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 py-24 text-center">
      <p
        className="font-display text-[7rem] leading-none tracking-wide text-accent-lime/25 md:text-[10rem]"
        aria-hidden="true"
      >
        404
      </p>

      <h1 className="mt-2 font-display text-4xl tracking-wide text-white md:text-5xl">
        {siteConfig.notFound.title}
      </h1>
      <p className="mt-4 max-w-md text-text-secondary">
        {siteConfig.notFound.message}
      </p>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link
          href="/"
          className="btn-primary rounded-full px-6 py-3 text-sm font-semibold text-white"
        >
          {siteConfig.notFound.cta}
        </Link>
        <Link
          href="/#booking"
          className="rounded-full border border-accent-lime/60 px-6 py-3 text-sm font-semibold text-accent-lime transition-colors hover:bg-accent-lime hover:text-bg-primary"
        >
          Book a Consultation
        </Link>
      </div>

      {/* Keeps a wrong URL inside the funnel rather than ending the visit. */}
      <nav
        className="mt-12 flex flex-wrap items-center justify-center gap-x-6 gap-y-2"
        aria-label="Site sections"
      >
        {siteConfig.navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="text-sm text-text-muted transition-colors hover:text-accent-lime"
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
