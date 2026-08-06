"use client";

import { MotionConfig } from "motion/react";
import { useReducedMotion } from "@/hooks/useReducedMotion";

/**
 * Global motion policy. Under prefers-reduced-motion, `reducedMotion="user"`
 * makes Motion strip transform/layout animations and keep opacity only, so
 * every Reveal in the tree degrades to an instant fade without per-component
 * branching.
 */
export function MotionProvider({ children }: { children: React.ReactNode }) {
  const reducedMotion = useReducedMotion();

  return (
    <MotionConfig
      reducedMotion="user"
      transition={
        reducedMotion
          ? { duration: 0 }
          : { duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }
      }
    >
      {children}
    </MotionConfig>
  );
}
