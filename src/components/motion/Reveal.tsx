"use client";

import { motion, type Variants } from "motion/react";
import { cn } from "@/lib/utils";
import {
  buildVariants,
  isThreeD,
  EASE_OUT_EXPO,
  type RevealPreset,
} from "./variants";

type Direction = "up" | "down" | "left" | "right" | "none";

/** Legacy `direction` prop maps onto the preset vocabulary. */
const directionToPreset: Record<Direction, RevealPreset> = {
  up: "fade-up",
  down: "fade-down",
  left: "fade-left",
  right: "fade-right",
  none: "fade",
};

type Tag = "div" | "section" | "article" | "li" | "span" | "ul" | "p";

interface RevealProps {
  children: React.ReactNode;
  /** Preferred API — picks one of the named entrance presets. */
  preset?: RevealPreset;
  /** Legacy shorthand, still honoured. Ignored when `preset` is set. */
  direction?: Direction;
  delay?: number;
  className?: string;
  /** Adds a blur-clear on top of whichever preset is active. */
  blur?: boolean;
  /** Stretch or compress the preset's own duration. */
  speed?: number;
  /** How much of the element must be in view before it fires. */
  amount?: number;
  /** Replay the animation every time it re-enters the viewport. */
  repeat?: boolean;
  as?: Tag;
}

/**
 * Single-element scroll reveal built on the shared preset vocabulary.
 * Fires once when the element crosses into view; reduced motion is handled
 * globally by MotionConfig in MotionProvider, which strips transforms and
 * collapses durations to zero.
 */
export function Reveal({
  children,
  preset,
  direction = "up",
  delay = 0,
  className,
  blur = false,
  speed = 1,
  amount = 0.2,
  repeat = false,
  as = "div",
}: RevealProps) {
  const MotionTag = motion[as];
  const active = preset ?? directionToPreset[direction];
  const variants = buildVariants(active, delay, speed);

  // `blur` layers onto any preset — the preset may already blur, in which
  // case these writes are identical and harmless.
  const merged: Variants = blur
    ? {
        hidden: { ...(variants.hidden as object), filter: "blur(16px)" },
        visible: { ...(variants.visible as object), filter: "blur(0px)" },
      }
    : variants;

  return (
    <MotionTag
      className={cn(className)}
      style={isThreeD(active) ? { perspective: 1200 } : undefined}
      variants={merged}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: !repeat, amount }}
    >
      {children}
    </MotionTag>
  );
}

/**
 * Parent that staggers its RevealItem children. Use for card grids, pill
 * rows, and any list that should cascade rather than land as a block.
 */
export function RevealGroup({
  children,
  className,
  stagger = 0.12,
  delay = 0,
  amount = 0.15,
  /** Run the cascade back-to-front. */
  reverse = false,
  repeat = false,
  as = "div",
}: {
  children: React.ReactNode;
  className?: string;
  stagger?: number;
  delay?: number;
  amount?: number;
  reverse?: boolean;
  repeat?: boolean;
  as?: "div" | "ul";
}) {
  const MotionTag = motion[as];

  return (
    <MotionTag
      className={cn(className)}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: !repeat, amount }}
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: stagger,
            delayChildren: delay,
            staggerDirection: reverse ? -1 : 1,
          },
        },
      }}
    >
      {children}
    </MotionTag>
  );
}

/**
 * Child of RevealGroup. Inherits the parent's stagger timing, so it carries
 * no viewport logic of its own. `preset` selects the per-item gesture;
 * `scale` is the legacy shorthand for the scale preset.
 */
export function RevealItem({
  children,
  className,
  scale = false,
  preset,
  as = "div",
}: {
  children: React.ReactNode;
  className?: string;
  scale?: boolean;
  preset?: RevealPreset;
  as?: "div" | "li" | "article" | "span";
}) {
  const MotionTag = motion[as];
  const active: RevealPreset = preset ?? (scale ? "scale" : "fade-up");

  return (
    <MotionTag
      className={cn(className)}
      style={isThreeD(active) ? { perspective: 1200 } : undefined}
      variants={buildVariants(active)}
    >
      {children}
    </MotionTag>
  );
}

/**
 * Reveals its children one line/element at a time from behind a mask edge.
 * Distinct from RevealGroup in that the children slide up out of an
 * overflow-hidden slot rather than fading in place.
 */
export function MaskReveal({
  children,
  className,
  delay = 0,
  stagger = 0.1,
  as = "div",
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  stagger?: number;
  as?: "div" | "ul";
}) {
  const MotionTag = motion[as];
  const items = Array.isArray(children) ? children : [children];

  return (
    <MotionTag
      className={cn(className)}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.25 }}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: stagger, delayChildren: delay } },
      }}
    >
      {items.map((child, index) => (
        <span key={index} className="block overflow-hidden">
          <motion.span
            className="block"
            variants={{
              hidden: { y: "115%", opacity: 0 },
              visible: {
                y: "0%",
                opacity: 1,
                transition: { duration: 1, ease: [...EASE_OUT_EXPO] },
              },
            }}
          >
            {child}
          </motion.span>
        </span>
      ))}
    </MotionTag>
  );
}
