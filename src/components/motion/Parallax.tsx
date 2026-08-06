"use client";

import { useRef } from "react";
import { motion, useScroll, useSpring, useTransform } from "motion/react";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { cn } from "@/lib/utils";

interface ParallaxProps {
  children: React.ReactNode;
  className?: string;
  /**
   * Travel distance in px across the element's full scroll pass. Positive
   * moves the layer *against* the scroll (slower than the page); negative
   * moves it with the scroll (faster).
   */
  distance?: number;
  axis?: "y" | "x";
  /** Spring smoothing, so the layer trails the scroll instead of locking to it. */
  smooth?: boolean;
}

/**
 * Depth layer. Wrap any element to have it drift at a different rate than
 * the page as it passes through the viewport. Inert under reduced motion.
 */
export function Parallax({
  children,
  className,
  distance = 80,
  axis = "y",
  smooth = true,
}: ParallaxProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const raw = useTransform(scrollYProgress, [0, 1], [distance, -distance]);
  const smoothed = useSpring(raw, {
    stiffness: 120,
    damping: 30,
    mass: 0.4,
  });
  const value = smooth ? smoothed : raw;

  return (
    <motion.div
      ref={ref}
      className={cn(className)}
      style={reducedMotion ? undefined : axis === "y" ? { y: value } : { x: value }}
    >
      {children}
    </motion.div>
  );
}

/**
 * Scroll-linked scale + fade + blur envelope. The child grows into place as
 * it enters and eases back out as it leaves, which is what makes a long page
 * feel like a sequence of scenes rather than a flat scroll.
 */
export function ScrollScene({
  children,
  className,
  /** Scale at the extremes of the pass. */
  from = 0.86,
  /** Fade the edges of the pass as well as scaling them. */
  fade = true,
  /** Blur the element at the extremes. */
  blur = false,
}: {
  children: React.ReactNode;
  className?: string;
  from?: number;
  fade?: boolean;
  blur?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const scale = useSpring(
    useTransform(scrollYProgress, [0, 0.35, 0.65, 1], [from, 1, 1, from]),
    { stiffness: 130, damping: 30, mass: 0.4 },
  );
  const opacity = useTransform(
    scrollYProgress,
    [0, 0.25, 0.75, 1],
    [0.25, 1, 1, 0.25],
  );
  const filter = useTransform(
    scrollYProgress,
    [0, 0.3, 0.7, 1],
    ["blur(8px)", "blur(0px)", "blur(0px)", "blur(8px)"],
  );

  if (reducedMotion) {
    return <div className={cn(className)}>{children}</div>;
  }

  return (
    <motion.div
      ref={ref}
      className={cn(className)}
      style={{
        scale,
        ...(fade ? { opacity } : {}),
        ...(blur ? { filter } : {}),
      }}
    >
      {children}
    </motion.div>
  );
}

/**
 * Horizontal drift keyed to scroll — used for opposing rows and offset
 * columns so a grid doesn't arrive as one flat plane.
 */
export function ScrollDrift({
  children,
  className,
  distance = 120,
  rotate = 0,
}: {
  children: React.ReactNode;
  className?: string;
  distance?: number;
  rotate?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const x = useSpring(useTransform(scrollYProgress, [0, 1], [distance, -distance]), {
    stiffness: 110,
    damping: 30,
  });
  const r = useSpring(useTransform(scrollYProgress, [0, 1], [rotate, -rotate]), {
    stiffness: 110,
    damping: 30,
  });

  return (
    <motion.div
      ref={ref}
      className={cn(className)}
      style={reducedMotion ? undefined : { x, rotate: r }}
    >
      {children}
    </motion.div>
  );
}
