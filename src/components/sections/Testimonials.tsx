"use client";

import { useRef } from "react";
import { motion, useScroll, useSpring, useTransform } from "motion/react";
import { Star } from "lucide-react";
import { siteConfig, type Testimonial } from "@/data/site";
import { Card } from "@/components/ui/Card";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/motion/Reveal";

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, i) => (
        <motion.span
          key={i}
          // Stars pour in left to right as the card scrolls into view.
          initial={{ opacity: 0, scale: 0.3, rotate: -40 }}
          whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{
            delay: i * 0.07,
            type: "spring",
            stiffness: 300,
            damping: 15,
          }}
        >
          <Star
            className={`h-4 w-4 ${
              i < rating
                ? "fill-accent-orange text-accent-orange"
                : "fill-none text-white/20"
            }`}
            aria-hidden="true"
          />
        </motion.span>
      ))}
    </div>
  );
}

function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  return (
    <motion.div
      whileHover={{ y: -10, scale: 1.03 }}
      transition={{ type: "spring", stiffness: 280, damping: 20 }}
    >
      <Card
        as="blockquote"
        hover={false}
        className="mr-6 w-[320px] shrink-0 md:w-[380px]"
      >
        <StarRating rating={testimonial.rating} />
        <p className="mt-4 text-sm leading-relaxed text-text-secondary">
          &ldquo;{testimonial.quote}&rdquo;
        </p>
        <footer className="mt-6 border-t border-white/8 pt-4">
          <cite className="not-italic">
            <span className="block font-semibold text-white">
              {testimonial.name}
            </span>
            <span className="text-xs text-text-muted">{testimonial.role}</span>
          </cite>
        </footer>
      </Card>
    </motion.div>
  );
}

/**
 * Signature entrance: the heading pushes back from an oversized scale into
 * place, and the auto-scrolling track carries an extra scroll-linked X drift
 * so the row visibly reacts to the wheel on top of its own CSS loop.
 */
export function Testimonials() {
  const sectionRef = useRef<HTMLElement>(null);

  // Duplicated once so the -50% keyframe loops seamlessly.
  const loop = [...siteConfig.testimonials, ...siteConfig.testimonials];

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  // Applied to the wrapper, not the animating track, so it composes with the
  // CSS marquee instead of overwriting its transform.
  const trackX = useSpring(useTransform(scrollYProgress, [0, 1], [110, -110]), {
    stiffness: 110,
    damping: 30,
  });
  const orbY = useTransform(scrollYProgress, [0, 1], [-90, 90]);

  return (
    <section
      ref={sectionRef}
      id="testimonials"
      className="relative overflow-hidden bg-bg-secondary py-24 md:py-32"
      aria-labelledby="testimonials-heading"
    >
      <motion.div
        className="glow-orb left-1/2 top-0 h-[400px] w-[400px] -translate-x-1/2 bg-accent-orange/8"
        style={{ y: orbY }}
        aria-hidden="true"
      />

      <div className="section-container relative z-10">
        <Reveal preset="scale-down" amount={0.4}>
          <SectionHeading
            id="testimonials-heading"
            label="Social Proof"
            title="Client Testimonials"
            subtitle="Real results from real clients who transformed their lives."
            align="center"
            className="mx-auto"
          />
        </Reveal>
      </div>

      {/* Full-bleed track so cards run edge to edge. */}
      <div className="testimonial-wrapper marquee-wrapper relative z-10 mt-12">
        <motion.div style={{ x: trackX }}>
          <ul className="testimonial-track list-none p-0">
            {loop.map((testimonial, index) => (
              <li
                key={`${testimonial.id}-${index}`}
                // The duplicate half is decorative — hide it from screen readers.
                aria-hidden={index >= siteConfig.testimonials.length}
              >
                <TestimonialCard testimonial={testimonial} />
              </li>
            ))}
          </ul>
        </motion.div>
      </div>
    </section>
  );
}
