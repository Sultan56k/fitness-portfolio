"use client";

import { useRef } from "react";
import { motion, useScroll, useSpring, useTransform } from "motion/react";
import { siteConfig } from "@/data/site";

/**
 * Keyword band between the hero and the page body. On top of its CSS loop it
 * takes a scroll-linked X offset and a slight skew, so the band shears with
 * the scroll direction and settles when the page stops.
 */
export function Marquee() {
  const sectionRef = useRef<HTMLElement>(null);

  const text = siteConfig.marquee.join(" • ");
  const repeated = `${text} • ${text} • `;

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const x = useSpring(useTransform(scrollYProgress, [0, 1], [-160, 160]), {
    stiffness: 100,
    damping: 30,
  });
  const skewX = useSpring(useTransform(scrollYProgress, [0, 0.5, 1], [-6, 0, 6]), {
    stiffness: 100,
    damping: 30,
  });

  return (
    <section
      ref={sectionRef}
      className="velocity-skew overflow-hidden border-b border-white/8 bg-bg-secondary py-5"
      aria-label="Brand keywords"
    >
      <div className="marquee-wrapper">
        {/* Scroll transform lives on this wrapper so it composes with the
            CSS keyframe animation on .marquee-track below. */}
        <motion.div style={{ x, skewX }}>
          <div className="marquee-track">
            <span className="marquee-content font-display text-2xl tracking-widest text-accent-lime md:text-3xl">
              {repeated}
            </span>
            <span
              className="marquee-content font-display text-2xl tracking-widest text-accent-lime md:text-3xl"
              aria-hidden="true"
            >
              {repeated}
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
