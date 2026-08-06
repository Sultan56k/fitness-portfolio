import type { TargetAndTransition, Variants } from "motion/react";

/**
 * Shared easing curves. `EASE_OUT_EXPO` is the house curve for entrances —
 * it front-loads the distance so elements feel like they *arrive* rather than
 * drift. `EASE_SOFT` is the gentler curve used for opacity-only and
 * scroll-linked work where a hard stop would read as a snap.
 */
export const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;
export const EASE_SOFT = [0.25, 0.1, 0.25, 1] as const;
export const EASE_BACK = [0.34, 1.56, 0.64, 1] as const;

/**
 * The vocabulary of section entrances. Each section on the page picks a
 * different one so scrolling never repeats the same gesture twice in a row.
 *
 * Every variant animates only compositor-friendly properties (transform,
 * opacity, filter) — no layout-triggering values — so a full page of these
 * stays on the GPU.
 */
export type RevealPreset =
  | "fade"
  | "fade-up"
  | "fade-down"
  | "fade-left"
  | "fade-right"
  | "scale"
  | "scale-down"
  | "blur"
  | "blur-scale"
  | "clip-up"
  | "clip-left"
  | "rotate"
  | "flip"
  | "swing"
  | "drift";

interface PresetConfig {
  hidden: TargetAndTransition;
  visible: TargetAndTransition;
  /** Presets that animate `filter` or `clipPath` need a longer runway. */
  duration: number;
  ease: readonly [number, number, number, number];
}

const presets: Record<RevealPreset, PresetConfig> = {
  fade: {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    duration: 0.7,
    ease: EASE_SOFT,
  },
  "fade-up": {
    hidden: { opacity: 0, y: 64 },
    visible: { opacity: 1, y: 0 },
    duration: 0.9,
    ease: EASE_OUT_EXPO,
  },
  "fade-down": {
    hidden: { opacity: 0, y: -64 },
    visible: { opacity: 1, y: 0 },
    duration: 0.9,
    ease: EASE_OUT_EXPO,
  },
  "fade-left": {
    hidden: { opacity: 0, x: 80 },
    visible: { opacity: 1, x: 0 },
    duration: 1,
    ease: EASE_OUT_EXPO,
  },
  "fade-right": {
    hidden: { opacity: 0, x: -80 },
    visible: { opacity: 1, x: 0 },
    duration: 1,
    ease: EASE_OUT_EXPO,
  },
  scale: {
    hidden: { opacity: 0, scale: 0.78 },
    visible: { opacity: 1, scale: 1 },
    duration: 0.9,
    ease: EASE_OUT_EXPO,
  },
  "scale-down": {
    hidden: { opacity: 0, scale: 1.18 },
    visible: { opacity: 1, scale: 1 },
    duration: 1.1,
    ease: EASE_OUT_EXPO,
  },
  blur: {
    hidden: { opacity: 0, filter: "blur(20px)", y: 30 },
    visible: { opacity: 1, filter: "blur(0px)", y: 0 },
    duration: 1.1,
    ease: EASE_OUT_EXPO,
  },
  "blur-scale": {
    hidden: { opacity: 0, filter: "blur(24px)", scale: 1.12 },
    visible: { opacity: 1, filter: "blur(0px)", scale: 1 },
    duration: 1.2,
    ease: EASE_OUT_EXPO,
  },
  // Wipes reveal the element from behind a moving edge. inset() keeps the
  // element in flow the whole time, so nothing reflows when it lands.
  "clip-up": {
    hidden: { opacity: 0, clipPath: "inset(100% 0% 0% 0%)", y: 40 },
    visible: { opacity: 1, clipPath: "inset(0% 0% 0% 0%)", y: 0 },
    duration: 1.1,
    ease: EASE_OUT_EXPO,
  },
  "clip-left": {
    hidden: { opacity: 0, clipPath: "inset(0% 100% 0% 0%)" },
    visible: { opacity: 1, clipPath: "inset(0% 0% 0% 0%)" },
    duration: 1.1,
    ease: EASE_OUT_EXPO,
  },
  rotate: {
    hidden: { opacity: 0, rotate: -8, scale: 0.9, y: 50 },
    visible: { opacity: 1, rotate: 0, scale: 1, y: 0 },
    duration: 1,
    ease: EASE_OUT_EXPO,
  },
  // 3D presets need a perspective on the element itself, applied in Reveal.
  flip: {
    hidden: { opacity: 0, rotateX: -70, y: 60, transformPerspective: 1200 },
    visible: { opacity: 1, rotateX: 0, y: 0, transformPerspective: 1200 },
    duration: 1.1,
    ease: EASE_OUT_EXPO,
  },
  swing: {
    hidden: { opacity: 0, rotateY: 45, x: 70, transformPerspective: 1200 },
    visible: { opacity: 1, rotateY: 0, x: 0, transformPerspective: 1200 },
    duration: 1.1,
    ease: EASE_OUT_EXPO,
  },
  drift: {
    hidden: { opacity: 0, y: 100, scale: 0.94, filter: "blur(10px)" },
    visible: { opacity: 1, y: 0, scale: 1, filter: "blur(0px)" },
    duration: 1.3,
    ease: EASE_OUT_EXPO,
  },
};

/** Builds the two-state variant object for a preset, with delay applied. */
export function buildVariants(
  preset: RevealPreset,
  delay = 0,
  durationScale = 1,
): Variants {
  const config = presets[preset];

  return {
    hidden: config.hidden,
    visible: {
      ...config.visible,
      transition: {
        duration: config.duration * durationScale,
        delay,
        ease: [...config.ease],
      },
    },
  };
}

/** Presets that rely on a 3D transform need perspective set on the node. */
export function isThreeD(preset: RevealPreset): boolean {
  return preset === "flip" || preset === "swing";
}
