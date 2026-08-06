"use client";

import { motion, useScroll, useSpring } from "motion/react";

/**
 * Fixed page-progress bar across the top of the viewport. Spring-smoothed so
 * it glides with Lenis rather than stepping with raw wheel events.
 *
 * Purely decorative — hidden from the a11y tree.
 */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 140,
    damping: 28,
    restDelta: 0.001,
  });

  return (
    <motion.div
      className="fixed left-0 top-0 z-[70] h-[3px] w-full origin-left bg-gradient-to-r from-accent-lime via-accent-cyan to-accent-orange"
      style={{ scaleX }}
      aria-hidden="true"
    />
  );
}
