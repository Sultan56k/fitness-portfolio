import type { Metadata, Viewport } from "next";
import { Bebas_Neue, Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppButton } from "@/components/layout/WhatsAppButton";
import { MotionProvider } from "@/components/providers/MotionProvider";
import { SmoothScrollProvider } from "@/components/providers/SmoothScrollProvider";
import { ScrollProgress } from "@/components/motion/ScrollProgress";
import { GoogleAnalytics } from "@/components/analytics/GoogleAnalytics";
import { siteConfig } from "@/data/site";

const bebasNeue = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-bebas",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const pageTitle = `${siteConfig.brand.name} | Fitness Coach & Nutrition Specialist`;

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.brand.url),
  title: {
    default: pageTitle,
    /**
     * Child pages set a bare `title` and the brand is appended here, so no
     * page has to remember to add it — and none can drift from the format.
     * `absolute` on a child opts out where a page composes its own.
     */
    template: `%s | ${siteConfig.brand.name}`,
  },
  description: siteConfig.brand.description,
  keywords: [
    "fitness coach",
    "personal trainer",
    "nutrition specialist",
    "diet plans",
    "online fitness classes",
    "strength training",
    "fitness app",
    "BMI calculator app",
    "calorie tracker",
  ],
  /**
   * Canonical for the homepage. Inherited by any page that does not set its
   * own, which prevents the same content being indexed under both a bare and
   * a trailing-slash or query-parameter URL.
   */
  alternates: {
    canonical: "/",
    types: { "application/rss+xml": `${siteConfig.brand.url}/blog/rss.xml` },
  },
  authors: [{ name: siteConfig.brand.name, url: siteConfig.brand.url }],
  creator: siteConfig.brand.name,
  publisher: siteConfig.brand.name,
  category: "Health & Fitness",
  /**
   * Disables automatic phone-number detection on iOS, which otherwise rewrites
   * digit strings in body copy (prices, rep ranges) as tel: links.
   */
  formatDetection: { telephone: false, address: false, email: false },
  openGraph: {
    type: "website",
    url: siteConfig.brand.url,
    title: pageTitle,
    description: siteConfig.brand.description,
    siteName: siteConfig.brand.name,
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: `${siteConfig.brand.name} — ${siteConfig.brand.tagline}`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: pageTitle,
    description: siteConfig.brand.description,
    images: ["/opengraph-image"],
  },
  robots: {
    index: true,
    follow: true,
    /**
     * The `max-*` directives are opt-ins, not limits. By default Google shows a
     * short text snippet and no video/image preview from a page; -1 and "large"
     * grant it the full snippet and a large image thumbnail, which is what makes
     * an article listing occupy more of the results page.
     */
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },
};

/**
 * Colours the mobile browser chrome to match the page background, so the
 * status bar does not sit as a light band above a near-black site.
 */
export const viewport: Viewport = {
  // Must track --color-bg-primary. Left at the pre-v3 #0a0a0f it read as a
  // darker band above the lifted page background on mobile.
  themeColor: "#15181e",
  colorScheme: "dark",
};

/**
 * JSON-LD SoftwareApplication for the companion app. A separate entity from
 * the Person below rather than another `makesOffer` entry: an app is a product
 * with its own price, platform, and category, and only a SoftwareApplication
 * node is eligible for app-specific rich results.
 */
const appJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  // Stable identifier so the Person node's `owns` can reference this entity.
  "@id": siteConfig.app.url,
  name: `${siteConfig.app.name}: ${siteConfig.app.subtitle}`,
  description: siteConfig.app.intro,
  url: siteConfig.app.url,
  applicationCategory: "HealthApplication",
  operatingSystem: "iOS 15.1 or later",
  offers: {
    "@type": "Offer",
    price: 0,
    priceCurrency: "USD",
  },
  featureList: siteConfig.app.features.map((feature) => feature.title),
  author: {
    "@type": "Person",
    name: siteConfig.brand.name,
    url: siteConfig.brand.url,
  },
};

/**
 * WebSite node. Names the site as an entity in its own right and, via
 * `publisher`, ties every page back to the Person below — so the homepage, the
 * blog, and the app read as one operation rather than three unrelated results.
 */
const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${siteConfig.brand.url}/#website`,
  name: siteConfig.brand.name,
  alternateName: siteConfig.brand.shortName,
  description: siteConfig.brand.description,
  url: siteConfig.brand.url,
  inLanguage: "en",
  publisher: { "@id": `${siteConfig.brand.url}/#person` },
};

/**
 * JSON-LD Person schema (§16). Rendered into <head> so search engines can
 * attribute the services and social profiles to the trainer.
 */
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  // Stable identifier the WebSite node above points at as its publisher.
  "@id": `${siteConfig.brand.url}/#person`,
  name: siteConfig.brand.name,
  description: siteConfig.brand.description,
  url: siteConfig.brand.url,
  email: siteConfig.brand.email,
  jobTitle: "Fitness Coach & Nutrition Specialist",
  sameAs: [siteConfig.social.instagram],
  knowsAbout: [...siteConfig.expertise],
  // Ties the app entity above back to the trainer, so the two nodes are
  // understood as one entity's work rather than two unrelated results.
  owns: { "@id": siteConfig.app.url },
  makesOffer: [
    ...siteConfig.services.map((service) => ({
      "@type": "Offer",
      itemOffered: {
        "@type": "Service",
        name: service.title,
        description: service.description,
      },
    })),
    // Priced plans carry a priceSpecification so they are eligible for
    // price-bearing rich results, which the service entries above are not.
    // Flattened across categories, with the category name qualifying each plan
    // — "1 Month Plan" is ambiguous on its own once three product lines exist.
    ...siteConfig.pricing.categories.flatMap((category) =>
      category.plans.map((plan) => ({
        "@type": "Offer",
        name: `${category.label} — ${plan.name} (${plan.tagline})`,
        description: plan.description,
        priceSpecification: {
          "@type": "UnitPriceSpecification",
          price: plan.price,
          priceCurrency: "PKR",
        },
        itemOffered: {
          "@type": "Service",
          name: `${plan.name} — ${category.name}`,
          description: plan.description,
        },
      })),
    ),
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${bebasNeue.variable} ${inter.variable}`}>
      <head>
        {/* Feed autodiscovery — how readers and aggregators find the blog. */}
        <link
          rel="alternate"
          type="application/rss+xml"
          title={`${siteConfig.blog.title} | ${siteConfig.brand.name}`}
          href="/blog/rss.xml"
        />
        {/* Warms the connection to the GA endpoint, which is requested only
            after hydration and would otherwise pay full DNS+TLS then. */}
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        {/* Warms the connection to the font CDN before the CSS asks for it. */}
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(appJsonLd) }}
        />
      </head>
      <body className="font-body antialiased">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-accent-orange focus:px-4 focus:py-2 focus:text-white"
        >
          Skip to content
        </a>
        <MotionProvider>
          <SmoothScrollProvider>
            <div className="grain-overlay" aria-hidden="true" />
            <ScrollProgress />
            <Navbar />
            <main id="main-content">{children}</main>
            <Footer />
            <WhatsAppButton />
          </SmoothScrollProvider>
        </MotionProvider>
        <GoogleAnalytics />
      </body>
    </html>
  );
}
