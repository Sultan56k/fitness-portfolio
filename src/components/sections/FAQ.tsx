"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion, useScroll, useTransform } from "motion/react";
import { Plus } from "lucide-react";
import { siteConfig } from "@/data/site";
import { Button } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { RevealGroup, RevealItem } from "@/components/motion/Reveal";
import { EASE_OUT_EXPO } from "@/components/motion/variants";
import { cn } from "@/lib/utils";

/**
 * FAQPage structured data. This is what earns the expanded FAQ rich result in
 * search, so the markup must mirror the visible copy exactly.
 */
const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: siteConfig.faq.items.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: { "@type": "Answer", text: item.answer },
  })),
};

/**
 * Signature entrance: rows tilt in with a rotate-and-settle, a gesture used
 * nowhere else on the page.
 *
 * Accordion is single-open — opening one row closes the rest, which keeps the
 * section from growing tall enough to bury the Contact form below it.
 */
export function FAQ() {
  const sectionRef = useRef<HTMLElement>(null);
  const [openId, setOpenId] = useState<string | null>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const orbY = useTransform(scrollYProgress, [0, 1], [-90, 90]);

  return (
    <section
      ref={sectionRef}
      id="faq"
      className="relative overflow-hidden border-b border-white/8 bg-bg-secondary py-24 md:py-32"
      aria-labelledby="faq-heading"
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <motion.div
        className="glow-orb -left-40 top-1/4 h-[420px] w-[420px] bg-accent-cyan/8"
        style={{ y: orbY }}
        aria-hidden="true"
      />

      <div className="section-container relative z-10">
        <SectionHeading
          id="faq-heading"
          label="Questions"
          title={siteConfig.faq.title}
          subtitle={siteConfig.faq.subtitle}
          align="center"
          className="mx-auto"
        />

        <RevealGroup className="mx-auto mt-12 max-w-3xl space-y-3" stagger={0.08}>
          {siteConfig.faq.items.map((item) => {
            const isOpen = openId === item.id;

            return (
              <RevealItem key={item.id} preset="rotate">
                <div
                  className={cn(
                    "glass-panel overflow-hidden p-0 transition-colors duration-300",
                    isOpen ? "border-accent-lime/30" : "hover:border-white/20",
                  )}
                >
                  <h3>
                    <button
                      type="button"
                      className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
                      aria-expanded={isOpen}
                      aria-controls={`faq-panel-${item.id}`}
                      id={`faq-trigger-${item.id}`}
                      onClick={() => setOpenId(isOpen ? null : item.id)}
                    >
                      <span
                        className={cn(
                          "text-base font-semibold transition-colors duration-200 md:text-lg",
                          isOpen ? "text-accent-lime" : "text-white",
                        )}
                      >
                        {item.question}
                      </span>
                      <motion.span
                        className={cn(
                          "shrink-0 rounded-full border p-1.5 transition-colors duration-200",
                          isOpen
                            ? "border-accent-lime/40 text-accent-lime"
                            : "border-white/15 text-text-secondary",
                        )}
                        animate={{ rotate: isOpen ? 135 : 0 }}
                        transition={{ duration: 0.4, ease: [...EASE_OUT_EXPO] }}
                        aria-hidden="true"
                      >
                        <Plus className="h-4 w-4" />
                      </motion.span>
                    </button>
                  </h3>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        id={`faq-panel-${item.id}`}
                        role="region"
                        aria-labelledby={`faq-trigger-${item.id}`}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.4, ease: [...EASE_OUT_EXPO] }}
                        className="overflow-hidden"
                      >
                        <p className="px-6 pb-5 text-sm leading-relaxed text-text-secondary">
                          {item.answer}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </RevealItem>
            );
          })}
        </RevealGroup>

        <div className="mt-10 text-center">
          <p className="text-sm text-text-secondary">
            Still have a question?
          </p>
          <div className="mt-3">
            <Button href="/#contact-form" variant="secondary">
              Ask us directly
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
