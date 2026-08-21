import type { MetadataRoute } from "next";
import { siteConfig } from "@/data/site";

/**
 * Web app manifest. Gives the site a proper name, theme colour, and icon when
 * added to a phone's home screen, and sets the browser UI colour on Android.
 *
 * Not a full PWA — there is no service worker and no offline support, which is
 * deliberate: a manifest is the useful 90% of "add to home screen" without the
 * cache-invalidation cost of a service worker on a site that changes rarely.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${siteConfig.brand.name} — Fitness Coach & Nutrition Specialist`,
    short_name: siteConfig.brand.shortName,
    description: siteConfig.brand.description,
    start_url: "/",
    display: "standalone",
    // Both track --color-bg-primary in globals.css. Kept in sync with the
    // `viewport.themeColor` in layout.tsx — a mismatch shows as a coloured
    // flash on splash-screen launch.
    background_color: "#15181e",
    theme_color: "#15181e",
    categories: ["health", "fitness", "lifestyle"],
    // Points at the real brand mark in public/brand rather than the file-based
    // /icon and /apple-icon routes. Those are emitted with a content hash in
    // their URL, which a manifest written by hand cannot know; a stale literal
    // path there is a silent 404 on "add to home screen".
    icons: [
      {
        src: "/brand/icon-mark.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/brand/icon-mark.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
