"use client";

import { siteConfig } from "@/data/site";
import { AppStoreBadge } from "@/components/ui/AppStoreBadge";
import { PlayStoreBadge } from "@/components/ui/PlayStoreBadge";
import { Reveal } from "@/components/motion/Reveal";
import { Magnetic } from "@/components/motion/Magnetic";
import { trackEvent } from "@/lib/analytics";

const { secondaryApp } = siteConfig;

/**
 * Compact cross-link to the studio's second app.
 *
 * Deliberately lighter than the FitLife block above it: one panel, no device
 * render, no feature grid. The hierarchy is the point — FitLife is the
 * companion to the coaching and earns the section, this is a related product
 * that earns a card. Giving both equal weight would leave a visitor unsure
 * which app the plan they just read about actually uses.
 */
export function SecondaryAppCard() {
  const isPlay = secondaryApp.store === "play";
  const Badge = isPlay ? PlayStoreBadge : AppStoreBadge;

  return (
    <Reveal preset="fade-up" className="mt-16">
      <div className="glass-panel flex flex-col gap-8 p-8 transition-colors duration-300 hover:border-accent-lime/30 md:flex-row md:items-center md:justify-between md:p-10">
        {/* Copy */}
        <div className="max-w-xl">
          <p className="text-xs font-semibold uppercase tracking-wider text-accent-lime">
            {secondaryApp.label}
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2">
            <h3 className="font-display text-2xl tracking-wide text-white">
              {secondaryApp.name}
            </h3>
            <span className="text-text-muted" aria-hidden="true">
              ·
            </span>
            <span className="text-sm text-text-secondary">
              {secondaryApp.subtitle}
            </span>
            <span className="rounded-full border border-accent-lime/40 bg-accent-lime/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-accent-lime">
              {secondaryApp.price}
            </span>
          </div>

          <p className="mt-4 text-sm leading-relaxed text-text-secondary">
            {secondaryApp.description}
          </p>

          <ul className="mt-5 flex flex-wrap gap-2">
            {secondaryApp.highlights.map((highlight) => (
              <li
                key={highlight}
                className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs text-text-muted"
              >
                {highlight}
              </li>
            ))}
          </ul>
        </div>

        {/* Store CTA */}
        <div className="shrink-0 md:text-right">
          <Magnetic>
            <a
              href={secondaryApp.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() =>
                trackEvent(isPlay ? "play_store_click" : "app_store_click", {
                  source: "secondary_app_card",
                  app: secondaryApp.name,
                })
              }
              className="inline-block rounded-xl transition-transform duration-300 hover:scale-[1.04] focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-lime focus-visible:ring-offset-4 focus-visible:ring-offset-bg-primary"
            >
              <Badge />
              <span className="sr-only">
                {secondaryApp.cta} — opens the store listing in a new tab
              </span>
            </a>
          </Magnetic>

          <p className="mt-4 text-xs text-text-muted">
            {secondaryApp.platforms}
          </p>
        </div>
      </div>
    </Reveal>
  );
}
