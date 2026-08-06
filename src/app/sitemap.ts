import type { MetadataRoute } from "next";
import { siteConfig } from "@/data/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: siteConfig.brand.url,
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: `${siteConfig.brand.url}/privacy`,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${siteConfig.brand.url}/terms`,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];
}
