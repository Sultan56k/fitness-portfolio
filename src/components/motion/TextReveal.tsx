"use client";

import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { EASE_OUT_EXPO } from "./variants";

interface TextRevealProps {
  text: string;
  className?: string;
  delay?: number;
  /** Per-unit cascade. Characters want a tighter value than words. */
  stagger?: number;
  as?: "p" | "span" | "h2" | "h3";
}

/**
 * Per-character blur reveal. Each glyph resolves out of a blur while rising
 * slightly, producing a "developing" effect that reads well on short,
 * high-emphasis lines.
 *
 * The full string stays in the a11y tree via aria-label; the animated spans
 * are hidden, so screen readers get one clean sentence rather than a stream
 * of single letters.
 */
export function TextReveal({
  text,
  className,
  delay = 0,
  stagger = 0.018,
  as = "p",
}: TextRevealProps) {
  const MotionTag = motion[as];
  // Split on words first so wrapping still breaks at spaces, then animate
  // each character inside its word.
  const words = text.split(" ");

  return (
    <MotionTag
      className={cn("inline-block", className)}
      aria-label={text}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      variants={{
        hidden: {},
        visible: {
          transition: { staggerChildren: stagger, delayChildren: delay },
        },
      }}
    >
      {words.map((word, wordIndex) => (
        <span
          key={`${word}-${wordIndex}`}
          className="inline-block whitespace-nowrap"
          aria-hidden="true"
        >
          {word.split("").map((char, charIndex) => (
            <motion.span
              key={`${char}-${charIndex}`}
              className="inline-block"
              variants={{
                hidden: { opacity: 0, filter: "blur(10px)", y: 18 },
                visible: {
                  opacity: 1,
                  filter: "blur(0px)",
                  y: 0,
                  transition: { duration: 0.7, ease: [...EASE_OUT_EXPO] },
                },
              }}
            >
              {char}
            </motion.span>
          ))}
          {/* Preserve the inter-word space, which the split above dropped. */}
          {wordIndex < words.length - 1 && (
            <span className="inline-block">&nbsp;</span>
          )}
        </span>
      ))}
    </MotionTag>
  );
}

/**
 * Word-level variant: each word rises out of its own mask slot. Cheaper than
 * TextReveal for long paragraphs and reads as more editorial.
 */
export function WordReveal({
  text,
  className,
  delay = 0,
  stagger = 0.05,
  as = "p",
}: TextRevealProps) {
  const MotionTag = motion[as];
  const words = text.split(" ");

  return (
    <MotionTag
      className={cn("flex flex-wrap", className)}
      aria-label={text}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      variants={{
        hidden: {},
        visible: {
          transition: { staggerChildren: stagger, delayChildren: delay },
        },
      }}
    >
      {words.map((word, index) => (
        <span
          key={`${word}-${index}`}
          className="inline-block overflow-hidden pb-[0.1em] pr-[0.28em]"
          aria-hidden="true"
        >
          <motion.span
            className="inline-block"
            variants={{
              hidden: { y: "110%", opacity: 0 },
              visible: {
                y: "0%",
                opacity: 1,
                transition: { duration: 0.85, ease: [...EASE_OUT_EXPO] },
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
