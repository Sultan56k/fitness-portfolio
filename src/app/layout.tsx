import type { Metadata, Viewport } from "next";
import { Bebas_Neue, Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppButton } from "@/components/layout/WhatsAppButton";
import { MotionProvider } from "@/components/providers/MotionProvider";
import { SmoothScrollProvider } from "@/components/providers/SmoothScrollProvider";
import { ScrollProgress } from "@/components/motion/ScrollProgress";
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
  title: pageTitle,
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
 * JSON-LD Person schema (§16). Rendered into <head> so search engines can
 * attribute the services and social profiles to the trainer.
 */
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
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
      </body>
    </html>
  );
}
