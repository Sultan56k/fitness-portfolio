"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useScroll, useSpring, useTransform } from "motion/react";
import { siteConfig } from "@/data/site";
import { Card } from "@/components/ui/Card";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/Reveal";
import { TiltCard } from "@/components/motion/TiltCard";

/**
 * Signature entrance: the portrait swings in from the left on the Y axis
 * while the copy column rises, then the stats counters cascade and the
 * credential pills pop in on a scale.
 */
export function About() {
  const sectionRef = useRef<HTMLElement>(null);

  // Deep parallax on the portrait — it travels noticeably against the page.
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const imageY = useSpring(useTransform(scrollYProgress, [0, 1], [90, -90]), {
    stiffness: 120,
    damping: 30,
    mass: 0.4,
  });
  const imageScale = useTransform(scrollYProgress, [0, 0.5, 1], [0.92, 1, 0.92]);
  const orbY = useTransform(scrollYProgress, [0, 1], [140, -140]);
  const copyY = useSpring(useTransform(scrollYProgress, [0, 1], [50, -50]), {
    stiffness: 120,
    damping: 30,
    mass: 0.4,
  });

  return (
    <section
      ref={sectionRef}
      id="about"
      className="relative overflow-hidden border-b border-white/8 py-24 md:py-32"
      aria-labelledby="about-heading"
    >
      <motion.div
        className="glow-orb -left-40 top-1/3 h-[420px] w-[420px] bg-accent-lime/8"
        style={{ y: orbY }}
        aria-hidden="true"
      />

      <div className="section-container relative z-10 grid gap-12 lg:grid-cols-2 lg:items-center">
        <Reveal preset="swing" amount={0.25}>
          <motion.div style={{ y: imageY, scale: imageScale }}>
            <TiltCard max={7} lift={18}>
              <Card
                hover={false}
                className="relative aspect-[4/5] overflow-hidden p-0"
              >
                {/*
                  The source is 3:4 and the frame is 4:5, so the crop is
                  shallow. `object-top` biases what little is trimmed toward
                  the bottom of the frame — the subject's head sits in the
                  upper third, and centring would clip it.

                  `priority` is deliberately omitted: this sits below the fold
                  behind the hero, and preloading it would compete with the
                  LCP element for bandwidth.
                */}
                <Image
                  src="/images/trainer.jpg"
                  alt="Faisal Noor, certified fitness coach"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover object-top"
                  quality={85}
                />

                {/* Grade toward the page palette: the photo is cool office
                    daylight against a warm dark site, and unmodified it read
                    as a snapshot pasted onto the design. */}
                <div
                  className="pointer-events-none absolute inset-0 bg-gradient-to-t from-bg-primary/85 via-bg-primary/15 to-transparent"
                  aria-hidden="true"
                />
                <div
                  className="pointer-events-none absolute inset-0 mix-blend-soft-light bg-gradient-to-br from-accent-orange/25 to-accent-cyan/15"
                  aria-hidden="true"
                />

                {/* Name plate anchored in the gradient's dark foot, where it
                    has contrast without a scrim of its own. */}
                <div className="absolute inset-x-0 bottom-0 p-6">
                  <p className="font-display text-2xl tracking-wide text-white">
                    Faisal Noor
                  </p>
                  <p className="mt-1 text-xs font-semibold uppercase tracking-[0.18em] text-accent-lime">
                    Certified Fitness Coach
                  </p>
                </div>
              </Card>
            </TiltCard>
          </motion.div>
        </Reveal>

        <motion.div style={{ y: copyY }}>
          <SectionHeading
            id="about-heading"
            label="About"
            // The person, not the wordmark — this section is the bio, and
            // "Fit with Faisal Noor" reads as a brand rather than a byline.
            title="Faisal Noor"
            subtitle={siteConfig.bio.eyebrow}
          />

          {/* The bio proper. Previously this column jumped from the heading
              straight to the stat counters — numbers with no story behind
              them. */}
          <Reveal preset="fade-up" delay={0.1} className="mt-6">
            <div className="space-y-4">
              {siteConfig.bio.paragraphs.map((paragraph) => (
                <p
                  key={paragraph.slice(0, 32)}
                  className="text-sm leading-relaxed text-text-secondary md:text-base"
                >
                  {paragraph}
                </p>
              ))}
            </div>
          </Reveal>

          {/* The thesis the rest of the bio supports, pulled out so it reads
              as a stated belief rather than a trailing sentence. */}
          <Reveal preset="fade-up" delay={0.2}>
            <blockquote className="mt-6 border-l-2 border-accent-lime/60 pl-5">
              <p className="font-display text-lg leading-snug tracking-wide text-white md:text-xl">
                &ldquo;{siteConfig.bio.pullQuote}&rdquo;
              </p>
            </blockquote>
          </Reveal>

          <RevealGroup className="mt-8 grid grid-cols-3 gap-4" stagger={0.15}>
            {siteConfig.stats.map((stat) => (
              <RevealItem key={stat.label} preset="flip">
                <Card hover={false} className="p-4 text-center">
                  <p className="font-display text-3xl text-accent-lime md:text-4xl">
                    <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                  </p>
                  <p className="mt-1 text-xs text-text-muted md:text-sm">
                    {stat.label}
                  </p>
                </Card>
              </RevealItem>
            ))}
          </RevealGroup>

          <RevealGroup className="mt-6 flex flex-wrap gap-2" stagger={0.08}>
            {siteConfig.credentials.map((credential) => (
              <RevealItem key={credential} scale>
                <motion.span
                  className="inline-block rounded-full border border-accent-cyan/30 bg-accent-cyan/5 px-4 py-1.5 text-xs font-medium text-accent-cyan"
                  whileHover={{ scale: 1.08, y: -3 }}
                  transition={{ type: "spring", stiffness: 320, damping: 18 }}
                >
                  {credential}
                </motion.span>
              </RevealItem>
            ))}
          </RevealGroup>
        </motion.div>
      </div>
    </section>
  );
}
