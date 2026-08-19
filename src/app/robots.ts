import type { MetadataRoute } from "next";
import { siteConfig } from "@/data/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      /**
       * The contact endpoint is a POST-only JSON API. Crawling it wastes budget
       * that should go to the blog, and any response it produces for a GET is
       * an error page that must never be indexed.
       */
      disallow: ["/api/"],
    },
    sitemap: `${siteConfig.brand.url}/sitemap.xml`,
    // Declared explicitly so relative URLs elsewhere resolve against the
    // canonical origin rather than whatever host served the file.
    host: siteConfig.brand.url,
  };
}
