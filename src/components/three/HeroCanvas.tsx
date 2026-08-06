"use client";

import dynamic from "next/dynamic";
import { Suspense, useEffect, useState } from "react";
import type { MotionValue } from "motion/react";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { isWebGLAvailable } from "@/lib/webgl";
import { HeroSceneFallback } from "./HeroSceneFallback";
import { cn } from "@/lib/utils";

const HeroScene = dynamic(
  () => import("./HeroScene").then((mod) => mod.HeroScene),
  {
    ssr: false,
    loading: () => <HeroSceneFallback />,
  },
);

interface HeroCanvasProps {
  className?: string;
  /** Hero scroll progress (0→1), forwarded to the 3D scene. */
  scrollProgress?: MotionValue<number>;
  /** Fires when the dumbbell lands, cueing the hero's DOM labels. */
  onSettled?: () => void;
}

/**
 * Full-bleed 3D layer for the hero. Deliberately has no panel, border or
 * min-height of its own — it fills whatever box the hero gives it, and the
 * scene inside reframes itself to match (see useResponsiveFraming).
 *
 * Not exposed to assistive tech: the hero's visible text and DOM labels already
 * convey everything this depicts, so announcing it again would be redundant.
 */
export function HeroCanvas({
  className,
  scrollProgress,
  onSettled,
}: HeroCanvasProps) {
  const reducedMotion = useReducedMotion();
  const [webglReady, setWebglReady] = useState<boolean | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setWebglReady(isWebGLAvailable());

    const query = window.matchMedia("(max-width: 767px)");
    setIsMobile(query.matches);

    const onChange = (event: MediaQueryListEvent) => setIsMobile(event.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  const useFallback = reducedMotion || webglReady === false;

  // The fallback stands in for the canvas, so it must reveal the labels too —
  // otherwise they'd never appear for reduced-motion or no-WebGL visitors.
  useEffect(() => {
    if (webglReady === null) return;
    if (useFallback) onSettled?.();
  }, [webglReady, useFallback, onSettled]);

  return (
    <div className={cn("relative h-full w-full", className)} aria-hidden="true">
      {webglReady === null ? (
        <HeroSceneFallback />
      ) : useFallback ? (
        <HeroSceneFallback animated={!reducedMotion} />
      ) : (
        <Suspense fallback={<HeroSceneFallback />}>
          <HeroScene
            isMobile={isMobile}
            reducedMotion={reducedMotion}
            scrollProgress={scrollProgress}
            onSettled={onSettled}
          />
        </Suspense>
      )}
    </div>
  );
}
