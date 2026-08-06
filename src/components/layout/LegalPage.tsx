import Link from "next/link";
import { AlertTriangle, ArrowLeft } from "lucide-react";
import { siteConfig } from "@/data/site";

export interface LegalSection {
  heading: string;
  /** Rendered as paragraphs; strings only, no HTML injection. */
  body: string[];
  /** Optional bullet list rendered after the paragraphs. */
  bullets?: string[];
}

/**
 * Shared shell for /privacy and /terms. Server component — these pages are
 * static text and need none of the motion machinery the homepage sections use.
 *
 * py-32 clears the sticky navbar; the placeholder banner is deliberately loud
 * so this copy is never mistaken for reviewed legal text.
 */
export function LegalPage({
  title,
  intro,
  sections,
}: {
  title: string;
  intro: string;
  sections: LegalSection[];
}) {
  return (
    <div className="section-container py-32 md:py-40">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-accent-lime transition-colors hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to home
        </Link>

        <h1 className="mt-8 font-display text-5xl tracking-wide text-white md:text-6xl">
          {title}
        </h1>
        <p className="mt-3 text-sm text-text-muted">
          Last updated: {siteConfig.legal.lastUpdated}
        </p>

        <div
          className="mt-8 flex items-start gap-3 rounded-xl border border-accent-orange/30 bg-accent-orange/10 px-5 py-4"
          role="note"
        >
          <AlertTriangle
            className="mt-0.5 h-5 w-5 shrink-0 text-accent-orange"
            aria-hidden="true"
          />
          <p className="text-sm text-text-secondary">
            {siteConfig.legal.placeholderNotice}
          </p>
        </div>

        <p className="mt-8 leading-relaxed text-text-secondary">{intro}</p>

        {sections.map((section) => (
          <section key={section.heading} className="mt-10">
            <h2 className="font-display text-2xl tracking-wide text-white md:text-3xl">
              {section.heading}
            </h2>
            {section.body.map((paragraph, index) => (
              <p
                key={index}
                className="mt-4 leading-relaxed text-text-secondary"
              >
                {paragraph}
              </p>
            ))}
            {section.bullets && (
              <ul className="mt-4 list-disc space-y-2 pl-5 text-text-secondary marker:text-accent-lime">
                {section.bullets.map((bullet) => (
                  <li key={bullet} className="leading-relaxed">
                    {bullet}
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}

        <div className="mt-14 border-t border-white/8 pt-8">
          <p className="text-sm text-text-secondary">
            Questions about this page? Email{" "}
            <a
              href={`mailto:${siteConfig.brand.email}`}
              className="text-accent-lime underline underline-offset-4 hover:text-white"
            >
              {siteConfig.brand.email}
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
