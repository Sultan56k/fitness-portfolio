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
  | "contact_form_error";

export type AnalyticsProps = Record<string, string | number | boolean>;

interface AnalyticsWindow extends Window {
  /** Vercel Analytics queue. */
  va?: (event: "event", payload: Record<string, unknown>) => void;
  /** Plausible. */
  plausible?: (event: string, options?: { props?: AnalyticsProps }) => void;
  /** GA4 / gtag.js. */
  gtag?: (
    command: "event",
    event: string,
    params?: Record<string, unknown>,
  ) => void;
  /** GTM data layer. */
  dataLayer?: Record<string, unknown>[];
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
