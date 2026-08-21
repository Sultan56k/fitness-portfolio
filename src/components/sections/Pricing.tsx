"use client";

import { useRef, useState } from "react";
import { motion, useScroll, useSpring, useTransform } from "motion/react";
import { Apple, Check, Dumbbell, User, type LucideIcon } from "lucide-react";
import {
  siteConfig,
  type PricingCategory,
  type PricingPlan,
} from "@/data/site";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { RevealGroup, RevealItem } from "@/components/motion/Reveal";
import { Reveal } from "@/components/motion/Reveal";
import { Magnetic } from "@/components/motion/Magnetic";
import { TiltCard } from "@/components/motion/TiltCard";
import { cn, formatPrice } from "@/lib/utils";
import { setPlanIntent } from "@/lib/planIntent";
import { trackEvent } from "@/lib/analytics";
import { PlanDetailModal } from "./PlanDetailModal";

const categoryIcons: Record<PricingCategory["icon"], LucideIcon> = {
  apple: Apple,
  dumbbell: Dumbbell,
  user: User,
};

/** What the modal needs to render a plan in the context of its product line. */
type Selection = { plan: PricingPlan; category: PricingCategory };

/**
 * Three product lines stacked, each with its own row of tiers.
 *
 * Deliberately not a flat grid of nine: diet coaching, the strength course, and
 * consultancy sessions are separate products, and a single row would imply they
 * are nine points on one ladder. Grouping keeps each line's tiers comparable
 * against each other — which is the only comparison that means anything.
 *
 * Cards carry the highlights and open `PlanDetailModal` for the full spec, so
 * the row stays scannable without losing the detail behind it.
 */
export function Pricing() {
  const sectionRef = useRef<HTMLElement>(null);
  const [selection, setSelection] = useState<Selection | null>(null);

  function openPlan(plan: PricingPlan, category: PricingCategory) {
    trackEvent("plan_detail_open", { plan: plan.id, category: category.id });
    setSelection({ plan, category });
  }

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const orbY = useTransform(scrollYProgress, [0, 1], [-100, 100]);
  // The featured column drifts against its neighbours so each row arrives with
  // depth instead of as a flat bar.
  const featuredY = useSpring(useTransform(scrollYProgress, [0, 1], [40, -40]), {
    stiffness: 120,
    damping: 30,
  });

  return (
    <section
      ref={sectionRef}
      id="pricing"
      className="relative overflow-hidden border-b border-white/8 bg-bg-secondary py-24 md:py-32"
      aria-labelledby="pricing-heading"
    >
      <motion.div
        className="glow-orb -right-40 top-1/4 h-[460px] w-[460px] bg-accent-orange/8"
        style={{ y: orbY }}
        aria-hidden="true"
      />

      <div className="section-container relative z-10">
        <SectionHeading
          id="pricing-heading"
          label="Plans"
          title={siteConfig.pricing.title}
          subtitle={siteConfig.pricing.subtitle}
          align="center"
          className="mx-auto"
        />

        <div className="mt-16 space-y-20 md:space-y-24">
          {/* `siteConfig` is `as const`, so each plan narrows to its own literal
              type and optional fields (`bonus`, `ctaExternal`) vanish from the
              union wherever one entry omits them. Widening to the declared
              interfaces restores them as genuinely optional. */}
          {(siteConfig.pricing.categories as readonly PricingCategory[]).map(
            (category, index) => {
            const CategoryIcon = categoryIcons[category.icon];
            // Consultancy tiers are single sessions, not programs — they carry
            // less detail, so their row reads better in a tighter column.
            const isCompact = category.id === "consultancy";

            return (
              <div
                key={category.id}
                // Anchor target for the service cards' "View plans" link.
                id={`pricing-${category.id}`}
                className="scroll-mt-32"
              >
                <Reveal preset="fade-up">
                  <div className="mx-auto max-w-2xl text-center">
                    {/* Icon in a haloed ring, with the category's position in
                        the set. Three stacked blocks need a stronger opening
                        marker than a heading alone to read as distinct
                        products rather than one long list. */}
                    <span className="relative inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-accent-lime/25 bg-accent-lime/10 text-accent-lime">
                      <span
                        className="absolute inset-0 rounded-2xl bg-accent-lime/20 blur-xl"
                        aria-hidden="true"
                      />
                      <CategoryIcon
                        className="relative h-6 w-6"
                        aria-hidden="true"
                      />
                      <span
                        className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-bg-elevated text-[11px] font-bold text-accent-cyan ring-1 ring-white/10"
                        aria-hidden="true"
                      >
                        {index + 1}
                      </span>
                    </span>
                    <p className="mt-4 text-xs font-semibold uppercase tracking-[0.2em] text-accent-cyan">
                      {category.label}
                    </p>
                    <h3 className="mt-2 font-display text-2xl tracking-wide text-white md:text-3xl">
                      {category.name}
                    </h3>
                    {/* Gradient rule fading out at both ends — closes the
                        header without the hard edge of a full-width border. */}
                    <span
                      className="mx-auto mt-4 block h-px w-24 bg-gradient-to-r from-transparent via-accent-lime/50 to-transparent"
                      aria-hidden="true"
                    />
                    <p className="mt-4 text-sm leading-relaxed text-text-secondary">
                      {category.blurb}
                    </p>
                  </div>
                </Reveal>

                <RevealGroup
                  className={cn(
                    "mt-10 grid items-stretch gap-6",
                    isCompact
                      ? "mx-auto max-w-5xl md:grid-cols-3"
                      : "lg:grid-cols-3",
                  )}
                  stagger={0.15}
                >
                  {category.plans.map((plan) => (
                    <RevealItem
                      key={plan.id}
                      preset="clip-up"
                      className="h-full"
                    >
                      <motion.div
                        className="h-full"
                        style={plan.featured ? { y: featuredY } : undefined}
                      >
                        <TiltCard className="h-full" max={8} lift={18}>
                          <Card
                            as="article"
                            className={cn(
                              "relative flex h-full flex-col p-8",
                              // Every card reserves the badge's head-room, not
                              // just the featured one — otherwise the featured
                              // card's title sits lower than its neighbours'
                              // and the row's headings stop aligning.
                              "pt-12",
                              // No `scale` here. Scaling the featured card also
                              // scaled its badge and rounded corners, and the
                              // breakpoint it applied at differed between the
                              // program rows (lg:) and the consultancy row
                              // (md:), so the emphasis landed inconsistently.
                              // Border, glow, and the ring below carry it
                              // instead, at identical geometry on every row.
                              plan.featured &&
                                "border-accent-lime/40 shadow-[0_8px_40px_rgba(255,164,92,0.12)] ring-1 ring-accent-lime/20",
                            )}
                          >
                            {plan.featured && (
                              <span className="absolute left-1/2 top-4 -translate-x-1/2 whitespace-nowrap rounded-full bg-accent-lime px-4 py-1 text-xs font-semibold uppercase tracking-wider text-bg-primary shadow-[0_2px_12px_rgba(255,164,92,0.35)]">
                                Most Popular
                              </span>
                            )}

                            <div className="flex items-start justify-between gap-3">
                              <h4 className="font-display text-2xl tracking-wide text-white">
                                {plan.name}
                              </h4>
                              <span className="mt-1 shrink-0 rounded-full border border-white/10 px-3 py-1 text-xs font-medium text-text-muted">
                                {plan.timeline}
                              </span>
                            </div>
                            <p className="mt-1 text-sm font-medium text-accent-cyan">
                              {plan.tagline}
                            </p>

                            <p
                              className={cn(
                                "mt-3 text-sm leading-relaxed text-text-secondary",
                                !isCompact && "min-h-[4.5rem]",
                              )}
                            >
                              {plan.description}
                            </p>

                            {/* Price sits in its own banded row: it is the
                                comparison a visitor actually scans across, and
                                it was previously competing with the copy above
                                and the feature list below. */}
                            <p
                              className={cn(
                                "mt-6 flex items-baseline gap-2 rounded-xl px-4 py-3",
                                plan.featured
                                  ? "bg-accent-lime/10 ring-1 ring-accent-lime/25"
                                  : "bg-white/[0.03] ring-1 ring-white/8",
                              )}
                            >
                              <span
                                className={cn(
                                  "font-display text-4xl tracking-wide",
                                  plan.featured
                                    ? "text-accent-lime"
                                    : "text-white",
                                )}
                              >
                                {siteConfig.pricing.currency}{" "}
                                {formatPrice(plan.price)}
                              </span>
                              <span className="text-sm text-text-muted">
                                {plan.priceNote}
                              </span>
                            </p>

                            <ul className="mt-6 flex-1 list-none space-y-3 p-0">
                              {plan.features.map((feature) => (
                                <li
                                  key={feature}
                                  className="flex items-start gap-3"
                                >
                                  <Check
                                    className="mt-0.5 h-4 w-4 shrink-0 text-accent-lime"
                                    aria-hidden="true"
                                  />
                                  <span className="text-sm text-text-secondary">
                                    {feature}
                                  </span>
                                </li>
                              ))}
                            </ul>

                            {plan.bonus && (
                              <p className="mt-4 rounded-lg border border-accent-orange/25 bg-accent-orange/5 px-3 py-2 text-xs leading-relaxed text-accent-orange">
                                Bonus: {plan.bonus}
                              </p>
                            )}

                            <div className="mt-8 space-y-3">
                              <Magnetic className="w-full" strength={8}>
                                <Button
                                  href={plan.ctaHref}
                                  external={plan.ctaExternal}
                                  variant={
                                    plan.featured ? "primary" : "secondary"
                                  }
                                  className="block w-full text-center"
                                  onClick={() => {
                                    // Carry the plan to whichever destination
                                    // the CTA points at, so the enquiry arrives
                                    // qualified instead of anonymous.
                                    setPlanIntent(
                                      `${category.label} — ${plan.name}`,
                                    );
                                    trackEvent("pricing_cta_click", {
                                      plan: plan.id,
                                      category: category.id,
                                      price: plan.price,
                                      destination: plan.ctaHref,
                                      source: "pricing_card",
                                    });
                                  }}
                                >
                                  {plan.ctaLabel}
                                </Button>
                              </Magnetic>
                              <button
                                type="button"
                                onClick={() => openPlan(plan, category)}
                                aria-haspopup="dialog"
                                className="w-full rounded text-sm font-medium text-text-muted transition-colors duration-300 hover:text-accent-lime focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-lime/50"
                              >
                                Full details
                                <span className="sr-only">
                                  {" "}
                                  for {plan.name}, {category.name}
                                </span>
                              </button>
                            </div>
                          </Card>
                        </TiltCard>
                      </motion.div>
                    </RevealItem>
                  ))}
                </RevealGroup>

                {category.note && (
                  <p className="mt-6 text-center text-sm text-text-muted">
                    {category.note}
                  </p>
                )}
              </div>
              );
            },
          )}
        </div>

        {/* Published terms. These are commitments rather than fine print —
            the medical-advice line in particular has to be visible on the
            page, not only inside a modal. */}
        <Reveal preset="fade-up" className="mx-auto mt-20 max-w-3xl">
          <ul className="list-none space-y-2 rounded-2xl border border-white/8 bg-bg-elevated/40 p-6 text-xs leading-relaxed text-text-muted">
            {siteConfig.pricing.disclaimers.map((note) => (
              <li key={note} className="flex items-start gap-2">
                <span aria-hidden="true" className="mt-1.5 text-accent-lime">
                  •
                </span>
                <span>{note}</span>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>

      <PlanDetailModal
        selection={selection}
        onClose={() => setSelection(null)}
      />
    </section>
  );
}
