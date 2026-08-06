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
    icons: [
      {
        src: "/icon",
        sizes: "32x32",
        type: "image/png",
      },
      {
        src: "/apple-icon",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  };
}
