"use client";

import { useEffect, useRef } from "react";
import { trackEvent, type AnalyticsEvent, type AnalyticsProps } from "@/lib/analytics";

/**
 * Fires a single event on mount, for pages rather than scroll positions.
 *
 * The GA page_view already records that a URL was opened, but it carries only
 * the path. This adds the dimensions that make blog traffic answerable —
 * which post, which tag, which funnel bucket — so "what topics pull readers"
 * is a report rather than a manual URL-to-title mapping.
 *
 * A separate component from SectionTracker because the question is different:
 * that one asks how far down a page someone scrolled, this one asks what they
 * opened. Renders nothing.
 */
export function PageViewEvent({
  event,
  props,
}: {
  event: AnalyticsEvent;
  props?: AnalyticsProps;
}) {
  // Guards against React 18+ StrictMode double-mounting in development, which
  // would otherwise log every page view twice while testing.
  const sent = useRef(false);

  // Serialised so the effect re-runs when the values change but not when the
  // caller passes a fresh object literal with identical contents each render.
  const key = JSON.stringify(props ?? {});

  useEffect(() => {
    if (sent.current) return;
    sent.current = true;
    trackEvent(event, JSON.parse(key) as AnalyticsProps);
  }, [event, key]);

  return null;
}
