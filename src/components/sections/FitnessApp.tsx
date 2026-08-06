"use client";

import { useRef } from "react";
import {
  motion,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react";
import {
  Activity,
  Bell,
  Calculator,
  Dumbbell,
  Footprints,
  Utensils,
  type LucideIcon,
} from "lucide-react";
import { siteConfig, type AppFeature } from "@/data/site";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { AppStoreBadge } from "@/components/ui/AppStoreBadge";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/Reveal";
import { Magnetic } from "@/components/motion/Magnetic";
import { AppPreview } from "./AppPreview";
import { trackEvent } from "@/lib/analytics";

const iconMap: Record<AppFeature["icon"], LucideIcon> = {
  calculator: Calculator,
  activity: Activity,
  utensils: Utensils,
  dumbbell: Dumbbell,
  bell: Bell,
  footprints: Footprints,
};

const { app } = siteConfig;

/**
 * Companion-app section.
 *
 * Signature entrance: the device swings in on the Y axis from the right while
 * the copy column reveals from the left — the mirror of the Classes section's
 * wipe, and a gesture no neighbouring section uses.
 */
export function FitnessApp() {
  const sectionRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const orbY = useTransform(scrollYProgress, [0, 1], [-100, 100]);
  // The device floats against the scroll so it reads as a layer in front of
  // the section rather than pasted onto it.
  const deviceY = useSpring(useTransform(scrollYProgress, [0, 1], [50, -50]), {
    stiffness: 120,
    damping: 30,
  });

  return (
    <section
      ref={sectionRef}
      id="app"
      className="relative overflow-hidden border-b border-white/8 bg-bg-primary py-24 md:py-32"
      aria-labelledby="app-heading"
    >
      <motion.div
        className="glow-orb -left-40 top-1/3 h-[420px] w-[420px] bg-accent-orange/8"
        style={{ y: orbY }}
        aria-hidden="true"
      />

      <div className="section-container relative z-10">
        <div className="grid gap-14 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-16">
          {/* Copy column */}
          <div>
            <SectionHeading
              id="app-heading"
              label={app.label}
              title={app.title}
              subtitle={app.intro}
            />

            <Reveal preset="fade-up" delay={0.15} className="mt-6">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                <span className="font-display text-2xl tracking-wide text-white">
                  {app.name}
                </span>
                <span className="text-text-muted" aria-hidden="true">
                  ·
                </span>
                <span className="text-sm text-text-secondary">
                  {app.subtitle}
                </span>
                <span className="rounded-full border border-accent-lime/40 bg-accent-lime/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-accent-lime">
                  {app.price}
                </span>
              </div>
              <p className="mt-2 text-sm text-text-muted">{app.tagline}</p>
            </Reveal>

            <Reveal preset="fade-up" delay={0.25} className="mt-6">
              <p className="max-w-xl leading-relaxed text-text-secondary">
                {app.positioning}
              </p>
            </Reveal>

            {/* Spec row */}
            <RevealGroup
              className="mt-8 grid max-w-xl grid-cols-2 gap-x-6 gap-y-4 border-y border-white/8 py-6 sm:grid-cols-4"
              stagger={0.08}
              as="ul"
            >
              {app.facts.map((fact) => (
                <RevealItem key={fact.label} as="li">
                  <p className="text-xs uppercase tracking-wider text-text-muted">
                    {fact.label}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-white">
                    {fact.value}
                  </p>
                </RevealItem>
              ))}
            </RevealGroup>

            <Reveal preset="fade-up" delay={0.2} className="mt-8">
              <Magnetic>
                <a
                  href={app.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() =>
                    trackEvent("app_store_click", { source: "app_section" })
                  }
                  className="inline-block rounded-xl transition-transform duration-300 hover:scale-[1.04] focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-lime focus-visible:ring-offset-4 focus-visible:ring-offset-bg-primary"
                >
                  <AppStoreBadge />
                  <span className="sr-only">
                    {app.cta} — opens the App Store in a new tab
                  </span>
                </a>
              </Magnetic>

              <p className="mt-4 text-xs text-text-muted">
                {app.platforms} · {app.requirements}
              </p>
              <p className="mt-1 text-xs text-text-muted">{app.androidNote}</p>
            </Reveal>
          </div>

          {/* Device column */}
          <Reveal preset="swing" amount={0.2} className="lg:order-last">
            <motion.div style={{ y: deviceY }}>
              <AppPreview />
            </motion.div>
          </Reveal>
        </div>

        {/* Feature grid */}
        <RevealGroup
          className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          stagger={0.1}
          as="ul"
        >
          {app.features.map((feature) => {
            const Icon = iconMap[feature.icon];
            return (
              <RevealItem
                key={feature.id}
                as="li"
                className="glass-panel p-6 transition-all duration-300 hover:-translate-y-1.5 hover:border-accent-lime/30"
              >
                <span className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-full bg-accent-lime/10 text-accent-lime">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <h3 className="text-base font-semibold text-white">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                  {feature.description}
                </p>
              </RevealItem>
            );
          })}
        </RevealGroup>
      </div>
    </section>
  );
}
