"use client";

import { useCallback, useRef, useState } from "react";
import { motion, useScroll, useSpring, useTransform } from "motion/react";
import { ChevronDown } from "lucide-react";
import { siteConfig } from "@/data/site";
import { Button } from "@/components/ui/Button";
import { HeroCanvas } from "@/components/three/HeroCanvas";
import { AnimatedHeadline } from "@/components/motion/AnimatedHeadline";
import { Magnetic } from "@/components/motion/Magnetic";
import { HeroHighlights } from "./HeroHighlights";
import { trackEvent } from "@/lib/analytics";

/** CTA pair cascade — a touch of overshoot so the buttons land with weight. */
const ctaVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.9 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.8, ease: [0.34, 1.56, 0.64, 1] as const },
  },
};

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const [sceneReady, setSceneReady] = useState(false);

  // Scroll-linked exit. The hero doesn't just fade — it recedes: the copy
  // drifts up, shrinks, blurs and tilts back on the X axis, so the next
  // section reads as arriving *over* it rather than after it.
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  // Springing the exit keeps it gliding with Lenis instead of stepping
  // frame-for-frame with the wheel.
  const eased = useSpring(scrollYProgress, {
    stiffness: 130,
    damping: 30,
    mass: 0.35,
  });

  const contentY = useTransform(eased, [0, 1], [0, 220]);
  const contentOpacity = useTransform(eased, [0, 0.65], [1, 0]);
  const contentScale = useTransform(eased, [0, 1], [1, 0.82]);
  const contentBlur = useTransform(eased, [0, 0.8], ["blur(0px)", "blur(14px)"]);
  const contentRotate = useTransform(eased, [0, 1], [0, -9]);

  // The ambient glows and scrim move at their own rates for depth.
  const glowY = useTransform(eased, [0, 1], [0, -140]);
  const scrimOpacity = useTransform(eased, [0, 1], [1, 0.35]);
  const indicatorOpacity = useTransform(scrollYProgress, [0, 0.25], [1, 0]);

  const handleSceneSettled = useCallback(() => setSceneReady(true), []);

  return (
    <section
      ref={sectionRef}
      id="home"
      className="hero-backdrop relative isolate flex min-h-[92vh] items-center overflow-hidden border-b border-white/8 py-24 md:py-32"
      aria-labelledby="hero-heading"
    >
      {/* Fine grid for texture and scale, masked to fade out at the edges. */}
      <div className="hero-grid pointer-events-none absolute inset-0" aria-hidden="true" />

      {/*
        Atmospheric wash over the sunrise field. Deliberately oversized and
        anchored off-frame at the top right — it reads as light in the air
        around the flare, not as a discrete object floating in space, which
        is what made the previous version look like a galaxy.
      */}
      <motion.div
        className="hero-shape -right-[22%] top-[-30%] h-[105vh] w-[85vw] bg-accent-orange/[0.13] lg:w-[68vw]"
        style={{ y: glowY }}
        animate={{
          borderRadius: [
            "58% 42% 47% 53% / 52% 46% 54% 48%",
            "45% 55% 58% 42% / 47% 55% 45% 53%",
            "58% 42% 47% 53% / 52% 46% 54% 48%",
          ],
          scale: [1, 1.05, 1],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        aria-hidden="true"
      />

      {/* Cool counter-mass, bottom left: the unlit side of the sky. Keeps the
          gradient from collapsing into a single warm wash. */}
      <motion.div
        className="hero-shape -left-[30%] bottom-[-36%] h-[92vh] w-[78vw] bg-[#33465c]/28"
        style={{ y: glowY }}
        animate={{
          borderRadius: [
            "47% 53% 55% 45% / 48% 52% 48% 52%",
            "56% 44% 43% 57% / 55% 45% 55% 45%",
            "47% 53% 55% 45% / 48% 52% 48% 52%",
          ],
          scale: [1.04, 1, 1.04],
        }}
        transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }}
        aria-hidden="true"
      />

      {/* Horizon haze — light pooling low in the frame. */}
      <div className="hero-haze pointer-events-none absolute inset-0" aria-hidden="true" />

      {/*
        The 3D scene is a full-bleed background layer rather than a boxed panel
        in a grid cell. It is NOT wrapped in a CSS transform: scaling or
        translating a canvas element resamples its backing store, which is what
        made the old version look blurry and janky on scroll. All scroll
        response now happens inside the scene, in world space.
      */}
      <div className="absolute inset-0 z-0" aria-hidden="true">
        <HeroCanvas
          scrollProgress={scrollYProgress}
          onSettled={handleSceneSettled}
        />
        <HeroHighlights visible={sceneReady} />
      </div>

      {/*
        Vignette above the scene: darkens the outer frame so the lit centre
        holds the eye, the way a studio backdrop falls off toward its edges.
      */}
      <div
        className="hero-vignette pointer-events-none absolute inset-0 z-[1]"
        aria-hidden="true"
      />

      {/*
        Readability scrim. Previously a flat 75% black wash across the whole
        hero, which was the main reason the section read as near-pure black —
        it dimmed the backdrop and the product together.

        Now it is a directional gradient that only does work where the copy
        actually sits: opaque at the left edge, fully clear by the midpoint, so
        the right half keeps its contrast. Narrow viewports still get a full
        cover because the copy stacks over the scene there, but at a lighter
        weight and from an elevated tone rather than the darkest one.
      */}
      <motion.div
        className="pointer-events-none absolute inset-0 z-[2] bg-gradient-to-b from-[#141920]/80 via-[#181d25]/55 to-[#241d1c]/75 lg:bg-gradient-to-r lg:from-[#12171f]/95 lg:from-12% lg:via-[#171c24]/55 lg:via-46% lg:to-transparent lg:to-74%"
        style={{ opacity: scrimOpacity }}
        aria-hidden="true"
      />

      <div className="section-container relative z-10 w-full">
        <motion.div
          className="max-w-2xl [transform-style:preserve-3d]"
          style={{
            y: contentY,
            opacity: contentOpacity,
            scale: contentScale,
            filter: contentBlur,
            rotateX: contentRotate,
            transformPerspective: 1400,
            transformOrigin: "center top",
          }}
        >
          <motion.p
            className="flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.2em] text-accent-lime"
            initial={{ opacity: 0, y: 24, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Rule that draws itself out from the left, anchoring the eyebrow. */}
            <motion.span
              className="inline-block h-px bg-accent-lime/60"
              initial={{ width: 0 }}
              animate={{ width: 40 }}
              transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              aria-hidden="true"
            />
            Fitness · Health · Nutrition
          </motion.p>

          <AnimatedHeadline
            id="hero-heading"
            text={siteConfig.brand.tagline}
            delay={0.15}
            className="mt-4 font-display text-5xl leading-none tracking-wide text-white md:text-7xl lg:text-8xl"
          />

          <motion.p
            className="mt-6 max-w-xl text-lg text-text-secondary"
            initial={{ opacity: 0, y: 28, filter: "blur(12px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{
              duration: 1,
              delay: 0.75,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            {siteConfig.brand.description}
          </motion.p>

          <motion.div
            className="mt-8 flex flex-wrap gap-4"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: {
                transition: { staggerChildren: 0.12, delayChildren: 0.95 },
              },
            }}
          >
            <motion.div variants={ctaVariants}>
              <Magnetic>
                <Button
                  href="/#booking"
                  onClick={() => trackEvent("hero_cta_click", { cta: "book" })}
                >
                  Book Consultation
                </Button>
              </Magnetic>
            </motion.div>
            <motion.div variants={ctaVariants}>
              <Magnetic>
                <Button
                  href="/#services"
                  variant="secondary"
                  onClick={() =>
                    trackEvent("hero_cta_click", { cta: "services" })
                  }
                >
                  View Services
                </Button>
              </Magnetic>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>

      <motion.a
        href="/#about"
        className="absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2 text-text-muted transition-colors hover:text-accent-lime"
        aria-label="Scroll to about section"
        // Opacity is owned by the scroll value; the entrance animates y only,
        // so the two never fight over the same property.
        style={{ opacity: indicatorOpacity }}
        initial={{ y: 24 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.9, delay: 1.4, ease: [0.16, 1, 0.3, 1] }}
      >
        <span className="text-[0.65rem] uppercase tracking-[0.3em]">Scroll</span>
        <ChevronDown className="h-8 w-8 animate-bounce-chevron" />
      </motion.a>
    </section>
  );
}
