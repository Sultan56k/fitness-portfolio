"use client";

import { motion } from "motion/react";

/**
 * Page-level heading for the blog index and tag pages.
 *
 * Not `SectionHeading`: that component hardcodes `as="h2"`, which is correct
 * for a section inside the homepage but wrong here — these are standalone
 * pages whose main heading must be the `h1`, both for accessibility and
 * because search engines read the `h1` as the page's topic.
 */
const fadeUp = {
  hidden: { opacity: 0, y: 24, filter: "blur(8px)" },
  visible: { opacity: 1, y: 0, filter: "blur(0px)" },
};

export function BlogHeader({
  label,
  title,
  subtitle,
}: {
  label?: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="mx-auto max-w-3xl text-center">
      {label && (
        <motion.p
          className="flex items-center justify-center gap-3 text-sm font-semibold uppercase tracking-[0.2em] text-accent-lime"
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className="inline-block h-px w-8 bg-accent-lime/60" aria-hidden="true" />
          {label}
        </motion.p>
      )}

      <motion.h1
        className="mt-3 font-display text-5xl tracking-wide text-white md:text-6xl"
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        transition={{ duration: 0.7, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
      >
        {title}
      </motion.h1>

      {subtitle && (
        <motion.p
          className="mx-auto mt-5 max-w-2xl leading-relaxed text-text-secondary"
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.6, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
        >
          {subtitle}
        </motion.p>
      )}
    </div>
  );
}
