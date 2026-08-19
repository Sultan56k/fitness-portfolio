"use client";

import { useEffect, useRef } from "react";
import { trackEvent, type SectionName } from "@/lib/analytics";

/**
 * Reports that a page section was actually seen.
 *
 * Conversion events tell you what visitors clicked; they say nothing about how
 * far down the page people get before they leave. A `section_view` per section
 * turns the homepage into a measurable funnel — how many reach Pricing, how
 * many make it past it to Booking — which is what makes a drop-off diagnosable
 * rather than guessed at.
 *
 * Wraps the section rather than living inside each one so no section component
 * has to know analytics exists.
 */
export function SectionTracker({
  section,
  children,
  /**
   * Fraction of the section that must be on screen. 0.35 rather than a bare
   * intersection: a section clipping the viewport edge during a fast scroll
   * past it was not "viewed", and counting it would inflate every step of the
   * funnel equally and hide the real drop-off.
   */
  amount = 0.35,
}: {
  section: SectionName;
  children: React.ReactNode;
  amount?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    // Older Safari and any environment without IntersectionObserver simply
    // reports no section views rather than breaking the page.
    if (typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        trackEvent("section_view", { section });
        // Fires once per page load. A visitor scrolling up and down past
        // Pricing three times is one person reaching Pricing, not three.
        observer.disconnect();
      },
      { threshold: amount },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [section, amount]);

  // A plain block wrapper, not `display: contents`: a contents box generates
  // no layout box of its own, so IntersectionObserver has no geometry to
  // measure and would never fire. The sections below carry all their own
  // spacing and backgrounds, so an unstyled block around them is inert.
  return <div ref={ref}>{children}</div>;
}
