import { siteConfig } from "@/data/site";
import { Button } from "@/components/ui/Button";
import { getWhatsAppLink } from "@/lib/utils";
import type { Bucket } from "@/lib/blog";

/**
 * Conversion block closing every article, chosen by the post's funnel bucket.
 *
 * A visitor who read 1,200 words on training has shown far more intent than
 * one who bounced off the homepage — but only if the offer matches what they
 * just read. A diet article closing with a strength-course pitch wastes that
 * intent, so the bucket decides the offer rather than one generic block.
 *
 * Falls back to the consultation CTA when a post declares no bucket: it is the
 * lowest-friction offer and so the safest default.
 */
export function ArticleCta({ bucket }: { bucket?: Bucket }) {
  const whatsappLink = getWhatsAppLink(
    siteConfig.social.whatsapp.number,
    siteConfig.social.whatsapp.message,
  );

  const content = bucket ? siteConfig.blog.buckets[bucket] : siteConfig.blog.cta;

  // Only the APP bucket leaves the site (the App Store listing).
  const isExternal =
    "primaryExternal" in content && content.primaryExternal === true;

  return (
    <aside className="glass-panel mt-16 border-accent-orange/25 bg-accent-orange/[0.07] px-6 py-8 md:px-10 md:py-10">
      <h2 className="font-display text-3xl tracking-wide text-white md:text-4xl">
        {content.title}
      </h2>
      <p className="mt-3 max-w-2xl leading-relaxed text-text-secondary">
        {content.body}
      </p>
      <div className="mt-6 flex flex-wrap items-center gap-4">
        <Button href={content.primaryHref} external={isExternal}>
          {content.primary}
        </Button>
        {/* WhatsApp is the secondary route on every bucket — the escape hatch
            for someone with a question who is not ready to commit. */}
        <Button href={whatsappLink} external variant="secondary">
          {siteConfig.blog.cta.secondary}
        </Button>
      </div>
    </aside>
  );
}
