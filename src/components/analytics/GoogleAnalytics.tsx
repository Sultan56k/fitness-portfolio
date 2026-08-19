"use client";

import Script from "next/script";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef } from "react";

/**
 * GA4 / gtag.js loader.
 *
 * `src/lib/analytics.ts` has always forwarded events to `window.gtag`, but
 * nothing ever put a gtag on the page — so every conversion event the site
 * fired went nowhere. This component is that missing half.
 *
 * The measurement ID is read from `NEXT_PUBLIC_GA_MEASUREMENT_ID` so staging
 * and preview deploys can point at a different property (or none) without a
 * code change. When it is unset the component renders nothing and `trackEvent`
 * keeps no-opping exactly as before, so local dev never pollutes real data.
 */

const MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

/**
 * Reports SPA route changes.
 *
 * `send_page_view` is disabled in the config below and page_view is sent
 * manually here instead. gtag's automatic pageview only fires on a full
 * document load; with the App Router's client-side navigation, every visit
 * after the first — homepage → blog → a post — would otherwise be invisible,
 * and time-on-page would be attributed entirely to the landing URL.
 */
function PageViewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  // The gtag config call already sends the first page_view. Without this the
  // initial load would be counted twice.
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (!MEASUREMENT_ID) return;
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const query = searchParams.toString();
    const url = query ? `${pathname}?${query}` : pathname;

    window.gtag?.("event", "page_view", {
      page_path: url,
      page_location: window.location.href,
      page_title: document.title,
    });
  }, [pathname, searchParams]);

  return null;
}

export function GoogleAnalytics() {
  if (!MEASUREMENT_ID) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`}
        // Deferred until the page is interactive. Analytics must never compete
        // with the hero render for main-thread time on a mobile connection.
        strategy="afterInteractive"
      />
      <Script id="ga-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${MEASUREMENT_ID}', { send_page_view: false });
          gtag('event', 'page_view', {
            page_path: window.location.pathname + window.location.search,
            page_location: window.location.href,
            page_title: document.title
          });
        `}
      </Script>
      {/*
        useSearchParams opts its subtree into client-side rendering, which
        would deopt every static page in the app to dynamic without a Suspense
        boundary around it.
      */}
      <Suspense fallback={null}>
        <PageViewTracker />
      </Suspense>
    </>
  );
}
