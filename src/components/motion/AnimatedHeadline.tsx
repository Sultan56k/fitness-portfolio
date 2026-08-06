"use client";

import { motion } from "motion/react";
import { cn } from "@/lib/utils";

interface AnimatedHeadlineProps {
  text: string;
  className?: string;
  id?: string;
  delay?: number;
  as?: "h1" | "h2";
}

/**
 * Per-word mask reveal: each word sits in an overflow-hidden slot and slides
 * up from below the mask line, staggered. Reads as a premium editorial
 * entrance rather than a plain fade.
 *
 * The full string stays available to screen readers via aria-label while the
 * animated word spans are hidden from the a11y tree.
 */
export function AnimatedHeadline({
  text,
  className,
  id,
  delay = 0,
  as = "h1",
}: AnimatedHeadlineProps) {
  const words = text.split(" ");
  const MotionTag = as === "h1" ? motion.h1 : motion.h2;

  return (
    <MotionTag
      id={id}
      className={cn("flex flex-wrap", className)}
      aria-label={text}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.4 }}
      variants={{
        hidden: {},
        visible: {
          transition: { staggerChildren: 0.09, delayChildren: delay },
        },
      }}
    >
      {words.map((word, index) => (
        <span
          key={`${word}-${index}`}
          className="inline-block overflow-hidden pb-[0.12em] pr-[0.25em]"
          aria-hidden="true"
        >
          <motion.span
            className="inline-block will-change-transform"
            variants={{
              // The word rises out of the mask while un-blurring and
              // straightening from a slight tilt — the extra two properties
              // are what separate this from a plain slide-up.
              hidden: {
                y: "115%",
                opacity: 0,
                rotate: 4,
                filter: "blur(8px)",
              },
              visible: {
                y: "0%",
                opacity: 1,
                rotate: 0,
                filter: "blur(0px)",
                transition: { duration: 1.05, ease: [0.16, 1, 0.3, 1] },
              },
            }}
          >
            {word}
          </motion.span>
        </span>
      ))}
    </MotionTag>
  );
}
