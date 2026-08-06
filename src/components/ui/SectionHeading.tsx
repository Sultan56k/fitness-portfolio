"use client";

import { motion } from "motion/react";
import { AnimatedHeadline } from "@/components/motion/AnimatedHeadline";
import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  id?: string;
  label?: string;
  title: string;
  subtitle?: string;
  className?: string;
  align?: "left" | "center";
}

const fadeUp = {
  hidden: { opacity: 0, y: 24, filter: "blur(8px)" },
  visible: { opacity: 1, y: 0, filter: "blur(0px)" },
};

export function SectionHeading({
  id,
  label,
  title,
  subtitle,
  className,
  align = "left",
}: SectionHeadingProps) {
  return (
    <div className={cn(align === "center" && "text-center", className)}>
      {label && (
        <motion.p
          className={cn(
            "flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.2em] text-accent-lime",
            align === "center" && "justify-center",
          )}
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Rule draws out from the label, echoing the hero eyebrow. */}
          <motion.span
            className="inline-block h-px bg-accent-lime/60"
            initial={{ width: 0 }}
            whileInView={{ width: 32 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.9, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            aria-hidden="true"
          />
          {label}
        </motion.p>
      )}

      <AnimatedHeadline
        as="h2"
        id={id}
        text={title}
        delay={label ? 0.1 : 0}
        className={cn(
          "font-display text-4xl text-white md:text-5xl",
          align === "center" && "justify-center",
          label && "mt-2",
        )}
      />

      {subtitle && (
        <motion.p
          className={cn(
            "mt-4 max-w-2xl text-text-secondary",
            align === "center" && "mx-auto",
          )}
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.5 }}
          transition={{
            duration: 0.6,
            delay: 0.25,
            ease: [0.25, 0.1, 0.25, 1],
          }}
        >
          {subtitle}
        </motion.p>
      )}
    </div>
  );
}
