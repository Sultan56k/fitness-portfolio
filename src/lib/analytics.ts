/**
 * Provider-agnostic analytics event layer.
 *
 * The site had zero tracking: no way to tell whether the Calendly buttons, the
 * WhatsApp taps, or the contact form were converting. This module is the single
 * seam where that gets measured.
 *
 * Deliberately not tied to a vendor. `trackEvent` forwards to whichever of
 * Vercel Analytics / Plausible / GA4 happens to be present on `window` at call
 * time, and silently no-ops when none is. That means the call sites below can
 * be wired now and the provider chosen later without touching a component —
 * dropping the provider's script into the layout is the entire integration.
 */

/** Conversion events worth measuring. Kept as a closed union so a typo in a
 *  call site is a compile error rather than a silently-lost funnel step. */
export type AnalyticsEvent =
  | "hero_cta_click"
  | "booking_calendly_click"
  | "whatsapp_click"
  | "instagram_click"
  | "email_click"
  | "pricing_cta_click"
  | "plan_detail_open"
  | "service_detail_open"
  | "class_video_open"
  | "app_store_click"
  | "contact_form_submit"
  | "contact_form_success"
  | "contact_form_error"
  | "blog_share_click"
  | "blog_post_cta_click"
  /** A section scrolled into view. Carries `section` — see SectionName. */
  | "section_view"
  | "faq_open"
  | "nav_link_click"
  | "blog_post_view"
  | "blog_index_view"
  | "testimonial_view"
  | "outbound_click";

/**
 * Named page sections, in the order a visitor meets them.
 *
 * A closed union rather than a free string so the funnel reports on one stable
 * set of names — a "pricing" here and a "Pricing" there would split the same
 * step into two rows in GA4 and quietly understate both.
 */
export type SectionName =
  | "hero"
  | "about"
  | "services"
  | "expertise"
  | "pricing"
  | "app"
  | "booking"
  | "testimonials"
  | "faq"
  | "contact"
  | "classes"
  | "blog_index"
  | "blog_post";

export type AnalyticsProps = Record<string, string | number | boolean>;

interface AnalyticsWindow extends Window {
  /** Vercel Analytics queue. */
  va?: (event: "event", payload: Record<string, unknown>) => void;
  /** Plausible. */
  plausible?: (event: string, options?: { props?: AnalyticsProps }) => void;
  /** GA4 / gtag.js is declared on the global Window below, so it is
   *  inherited here rather than redeclared. */
  /** GTM data layer. */
  dataLayer?: Record<string, unknown>[];
}

/**
 * Augments the real `window` with the gtag the GA4 script installs.
 *
 * Declared globally rather than cast at each call site so the loader in
 * GoogleAnalytics.tsx and `trackEvent` below agree on one signature — the
 * event-name and params shape is then checked in both places instead of only
 * where the local interface above happens to be used.
 */
declare global {
  interface Window {
    gtag?: (
      command: "event" | "config" | "js" | "set",
      targetOrEvent: string | Date,
      params?: Record<string, unknown>,
    ) => void;
  }
}

/**
 * Record a conversion event.
 *
 * Never throws and never blocks the interaction it is attached to — an
 * analytics failure must not stop a visitor from reaching WhatsApp or Calendly.
 */
export function trackEvent(
  event: AnalyticsEvent,
  props: AnalyticsProps = {},
): void {
  // SSR and prerender: nothing to report to.
  if (typeof window === "undefined") return;

  const w = window as AnalyticsWindow;

  try {
    w.va?.("event", { name: event, data: props });
    w.plausible?.(event, { props });
    w.gtag?.("event", event, props);
    w.dataLayer?.push({ event, ...props });

    // Surfaces the funnel during local development, where no provider is
    // loaded and the calls above would otherwise be invisible.
    if (process.env.NODE_ENV === "development") {
      console.info(`[analytics] ${event}`, props);
    }
  } catch {
    // Analytics is strictly best-effort. Swallow provider errors.
  }
}
