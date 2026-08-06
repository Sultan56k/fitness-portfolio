"use client";

import { cn } from "@/lib/utils";

interface Highlight {
  id: string;
  text: string;
  accent: "lime" | "cyan";
  /** Position within the visual half of the hero, as CSS percentages. */
  placement: string;
  /** Connector runs to the left of the chip, or to the right. */
  align: "left" | "right";
}

/**
 * Replaces the old in-canvas drei <Html> pins. Those were projected from world
 * space every frame, which meant they drifted out of alignment under any CSS
 * transform on an ancestor and duplicated the hero's text for screen readers.
 * As plain DOM they land exactly where the design says, cost nothing per frame,
 * and can be hidden from assistive tech in one place.
 */
/**
 * The three offerings, mirroring the pricing categories.
 *
 * All three sit in the right half of the frame. Two of them were previously
 * anchored at `left-[4%]` and `left-[8%]` — directly behind the headline and
 * under the readability scrim, so only the right-hand chip was ever actually
 * visible. The hero copy occupies a `max-w-2xl` column on the left, and the
 * scrim clears by ~74% at `lg`, which is the band these now occupy.
 *
 * Staggered horizontally as well as vertically so the column reads as an arc
 * around the dumbbell rather than a stacked list.
 */
const HIGHLIGHTS: Highlight[] = [
  {
    id: "diet",
    text: "Diet Coaching",
    accent: "cyan",
    placement: "right-[6%] top-[24%]",
    align: "left",
  },
  {
    id: "strength",
    text: "Strength Training",
    accent: "lime",
    placement: "right-[3%] top-[45%]",
    align: "left",
  },
  {
    id: "consultancy",
    text: "1-on-1 Consultancy",
    accent: "cyan",
    placement: "right-[8%] top-[66%]",
    align: "left",
  },
];

const ACCENT = {
  lime: {
    dot: "bg-accent-lime shadow-[0_0_12px_rgba(255,164,92,0.9)]",
    ping: "bg-accent-lime/40",
    line: "bg-gradient-to-r from-accent-lime/80 to-accent-lime/0",
    text: "text-accent-lime",
    border: "border-accent-lime/30",
    glow: "shadow-[0_4px_24px_-4px_rgba(255,164,92,0.45)]",
  },
  cyan: {
    dot: "bg-accent-cyan shadow-[0_0_12px_rgba(255,217,160,0.9)]",
    ping: "bg-accent-cyan/40",
    line: "bg-gradient-to-r from-accent-cyan/80 to-accent-cyan/0",
    text: "text-accent-cyan",
    border: "border-accent-cyan/30",
    glow: "shadow-[0_4px_24px_-4px_rgba(255,217,160,0.45)]",
  },
} as const;

interface HeroHighlightsProps {
  /** Held back until the dumbbell lands, so the reveal stays on cue. */
  visible: boolean;
}

export function HeroHighlights({ visible }: HeroHighlightsProps) {
  return (
    <div
      className="pointer-events-none absolute inset-0 hidden lg:block"
      aria-hidden="true"
    >
      {HIGHLIGHTS.map((item, index) => {
        const accent = ACCENT[item.accent];
        const isRight = item.align === "right";

        return (
          // Two elements deep on purpose: the outer one owns the entrance
          // transition, the inner one the looping float. Both animate
          // `transform`, so sharing an element would have them overwrite each
          // other and the entrance would snap.
          <div
            key={item.id}
            className={cn(
              "absolute transition-all duration-700 ease-out motion-reduce:transition-none",
              item.placement,
              visible ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0",
            )}
            style={{ transitionDelay: `${index * 0.18}s` }}
          >
          <div
            className={cn(
              "flex animate-float-subtle items-center gap-2 whitespace-nowrap",
              isRight ? "flex-row-reverse" : "flex-row",
            )}
            style={{ animationDelay: `${index * 1.2}s` }}
          >
            {/* Anchor dot with a slow expanding ring behind it, so the pin
                reads as a live marker on the product rather than a static bullet. */}
            <span className="relative flex h-2 w-2 shrink-0 items-center justify-center">
              <span
                className={cn(
                  "absolute inset-0 rounded-full animate-pulse-ring motion-reduce:animate-none",
                  accent.ping,
                )}
                style={{ animationDelay: `${index * 0.9}s` }}
              />
              <span
                className={cn("relative h-2 w-2 rounded-full", accent.dot)}
              />
            </span>

            <span
              className={cn("h-px w-8", accent.line)}
              style={isRight ? { transform: "scaleX(-1)" } : undefined}
            />

            <span
              className={cn(
                "rounded-full border bg-bg-secondary/80 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] backdrop-blur-md",
                accent.border,
                accent.text,
                accent.glow,
              )}
            >
              {item.text}
            </span>
          </div>
          </div>
        );
      })}
    </div>
  );
}
