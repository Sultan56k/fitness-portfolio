"use client";

import { motion } from "motion/react";
import { Droplets, Flame, Footprints, Moon } from "lucide-react";

/**
 * Stylised render of the app's dashboard inside a phone frame.
 *
 * Drawn in CSS/SVG rather than shipped as a screenshot PNG: it stays sharp on
 * any display without a 2x/3x asset set, costs no image bytes, re-themes with
 * the palette tokens, and — most usefully — never goes stale when the app's UI
 * ships a new version. It is deliberately an *impression* of the dashboard
 * (rings, trend line, stat tiles), not a pixel copy, so it cannot misrepresent
 * the current build.
 *
 * Entirely decorative: the whole frame is aria-hidden and the real information
 * lives in the section's feature list beside it.
 */

/** Outer ring radius. 52 in a 120 box leaves room for the 9px stroke. */
const RING_RADIUS = 52;

interface RingProps {
  /** 0…1 completion. */
  progress: number;
  color: string;
  /** Inset from the outer ring, so the three nest concentrically. */
  inset: number;
  delay: number;
}

function Ring({ progress, color, inset, delay }: RingProps) {
  const radius = RING_RADIUS - inset;
  const circumference = 2 * Math.PI * radius;

  return (
    <>
      {/* Unfilled track. */}
      <circle
        cx="60"
        cy="60"
        r={radius}
        fill="none"
        stroke="rgba(255,255,255,0.07)"
        strokeWidth="9"
      />
      <motion.circle
        cx="60"
        cy="60"
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth="9"
        strokeLinecap="round"
        strokeDasharray={circumference}
        // Rings draw clockwise from 12 o'clock: rotate -90° about the centre.
        transform="rotate(-90 60 60)"
        initial={{ strokeDashoffset: circumference }}
        whileInView={{ strokeDashoffset: circumference * (1 - progress) }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 1.6, delay, ease: [0.16, 1, 0.3, 1] }}
      />
    </>
  );
}

const tiles = [
  { id: "steps", icon: Footprints, value: "8,420", label: "Steps" },
  { id: "water", icon: Droplets, value: "2.1 L", label: "Water" },
  { id: "sleep", icon: Moon, value: "7h 20m", label: "Sleep" },
  { id: "burn", icon: Flame, value: "480", label: "Burned" },
];

export function AppPreview() {
  return (
    <div
      className="relative mx-auto w-full max-w-[300px] select-none"
      aria-hidden="true"
    >
      {/* Ambient bloom behind the device, so it sits in light rather than on
          a flat panel. */}
      <div className="glow-orb left-1/2 top-1/3 h-[320px] w-[320px] -translate-x-1/2 bg-accent-orange/20" />

      {/* Device frame. */}
      <div className="relative rounded-[2.75rem] border border-white/12 bg-gradient-to-b from-white/12 to-white/[0.04] p-[3px] shadow-[0_30px_80px_-20px_rgba(0,0,0,0.8)]">
        <div className="relative overflow-hidden rounded-[2.6rem] bg-bg-primary">
          {/* Dynamic Island. */}
          <div className="absolute left-1/2 top-3 z-10 h-[22px] w-[84px] -translate-x-1/2 rounded-full bg-black" />

          {/* Screen. */}
          <div className="bg-gradient-to-b from-bg-elevated via-bg-secondary to-bg-primary px-5 pb-6 pt-12">
            <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-text-muted">
              Today
            </p>
            <p className="mt-0.5 font-display text-2xl tracking-wide text-white">
              1,840 <span className="text-sm text-text-secondary">kcal left</span>
            </p>

            {/* Nested progress rings — calories, protein, activity. */}
            <div className="mt-4 flex justify-center">
              <svg viewBox="0 0 120 120" className="h-[132px] w-[132px]">
                <Ring progress={0.72} color="#ff6b35" inset={0} delay={0.2} />
                <Ring progress={0.55} color="#ffa45c" inset={13} delay={0.35} />
                <Ring progress={0.86} color="#ffd9a0" inset={26} delay={0.5} />
              </svg>
            </div>

            {/* Stat tiles. */}
            <div className="mt-4 grid grid-cols-2 gap-2">
              {tiles.map((tile, index) => {
                const Icon = tile.icon;
                return (
                  <motion.div
                    key={tile.id}
                    className="rounded-xl border border-white/8 bg-white/[0.04] px-2.5 py-2"
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.5 }}
                    transition={{
                      duration: 0.5,
                      delay: 0.7 + index * 0.08,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                  >
                    <Icon className="h-3 w-3 text-accent-lime" />
                    <p className="mt-1 text-sm font-semibold leading-none text-white">
                      {tile.value}
                    </p>
                    <p className="mt-1 text-[10px] leading-none text-text-muted">
                      {tile.label}
                    </p>
                  </motion.div>
                );
              })}
            </div>

            {/* Weight trend sparkline. */}
            <div className="mt-3 rounded-xl border border-white/8 bg-white/[0.04] px-3 py-2.5">
              <div className="flex items-baseline justify-between">
                <p className="text-[10px] uppercase tracking-wider text-text-muted">
                  Weight
                </p>
                <p className="text-[10px] font-medium text-accent-lime">
                  −2.4 kg
                </p>
              </div>
              <svg
                viewBox="0 0 200 44"
                className="mt-1.5 h-9 w-full"
                preserveAspectRatio="none"
              >
                <defs>
                  <linearGradient id="app-spark" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ff6b35" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#ff6b35" stopOpacity="0" />
                  </linearGradient>
                </defs>
                {/* Area fill under the trend. */}
                <motion.path
                  d="M0 12 L33 18 L66 15 L100 24 L133 22 L166 31 L200 34 L200 44 L0 44 Z"
                  fill="url(#app-spark)"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true, amount: 0.5 }}
                  transition={{ duration: 0.8, delay: 1.3 }}
                />
                <motion.path
                  d="M0 12 L33 18 L66 15 L100 24 L133 22 L166 31 L200 34"
                  fill="none"
                  stroke="#ff6b35"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  vectorEffect="non-scaling-stroke"
                  initial={{ pathLength: 0 }}
                  whileInView={{ pathLength: 1 }}
                  viewport={{ once: true, amount: 0.5 }}
                  transition={{
                    duration: 1.2,
                    delay: 1,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
