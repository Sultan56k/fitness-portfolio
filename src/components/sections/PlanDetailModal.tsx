"use client";

import { Check, Gift } from "lucide-react";
import {
  siteConfig,
  type PricingCategory,
  type PricingPlan,
} from "@/data/site";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { formatPrice, getWhatsAppLink } from "@/lib/utils";
import { setPlanIntent } from "@/lib/planIntent";
import { trackEvent } from "@/lib/analytics";

interface PlanDetailModalProps {
  /** The plan to show, plus the category it belongs to. null = closed. */
  selection: { plan: PricingPlan; category: PricingCategory } | null;
  onClose: () => void;
}

/**
 * Full specification for a single pricing plan.
 *
 * The cards carry only the highlights — the published rate card has five or six
 * rows per plan (check-in cadence, revision counts, support response times),
 * and forcing all of it onto a card makes the row unreadable. This is where
 * that detail lives, so the card can stay scannable without the detail being
 * lost.
 *
 * Always offers WhatsApp alongside the primary CTA. That matters most for the
 * consultancy tiers, whose Calendly events are not all published yet — the
 * secondary route means an unbooked link is a detour rather than a dead end.
 */
export function PlanDetailModal({ selection, onClose }: PlanDetailModalProps) {
  // Keep the dialog mounted through its exit animation; `open` drives presence.
  const open = selection !== null;
  const plan = selection?.plan;
  const category = selection?.category;

  /** Qualified name used for plan intent, WhatsApp, and analytics. */
  const qualifiedName =
    plan && category ? `${category.label} — ${plan.name}` : "";

  const whatsappLink = plan
    ? getWhatsAppLink(
        siteConfig.social.whatsapp.number,
        `Hi! I'd like to ask about the ${plan.name} (${plan.tagline}) — ${siteConfig.pricing.currency} ${formatPrice(plan.price)}.`,
      )
    : "";

  return (
    <Modal open={open} onClose={onClose} title={plan?.name ?? ""}>
      {plan && category && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-lime">
            {category.label}
          </p>
          <h2 className="mt-2 pr-10 font-display text-3xl tracking-wide text-white md:text-4xl">
            {plan.name}
          </h2>
          <p className="mt-1 text-sm font-medium text-accent-cyan">
            {plan.tagline} · {plan.timeline}
          </p>

          <p className="mt-4 flex items-baseline gap-2">
            <span className="font-display text-4xl tracking-wide text-accent-lime">
              {siteConfig.pricing.currency} {formatPrice(plan.price)}
            </span>
            <span className="text-sm text-text-muted">{plan.priceNote}</span>
          </p>

          <p className="mt-4 text-sm leading-relaxed text-text-secondary md:text-base">
            {plan.description}
          </p>

          <h3 className="mt-8 text-sm font-semibold uppercase tracking-wider text-white">
            What&apos;s included
          </h3>
          <ul className="mt-4 list-none space-y-3 p-0">
            {plan.features.map((feature) => (
              <li key={feature} className="flex items-start gap-3">
                <Check
                  className="mt-0.5 h-4 w-4 shrink-0 text-accent-lime"
                  aria-hidden="true"
                />
                <span className="text-sm text-text-secondary">{feature}</span>
              </li>
            ))}
          </ul>

          <h3 className="mt-8 text-sm font-semibold uppercase tracking-wider text-white">
            Full details
          </h3>
          {/* Definition list rather than a table: these are label/value pairs,
              and a real <dl> keeps the association intact for screen readers
              while collapsing cleanly to one column on mobile. */}
          <dl className="mt-4 divide-y divide-white/8 border-y border-white/8">
            {plan.details.map((row) => (
              <div
                key={row.label}
                className="grid gap-1 py-3 sm:grid-cols-[9rem_1fr] sm:gap-4"
              >
                <dt className="text-xs font-semibold uppercase tracking-wider text-text-muted">
                  {row.label}
                </dt>
                <dd className="m-0 text-sm leading-relaxed text-text-secondary">
                  {row.value}
                </dd>
              </div>
            ))}
          </dl>

          {plan.bonus && (
            <p className="mt-6 flex items-start gap-3 rounded-xl border border-accent-orange/30 bg-accent-orange/5 px-4 py-3">
              <Gift
                className="mt-0.5 h-4 w-4 shrink-0 text-accent-orange"
                aria-hidden="true"
              />
              <span className="text-sm text-text-secondary">
                <span className="font-semibold text-accent-orange">Bonus: </span>
                {plan.bonus}
              </span>
            </p>
          )}

          <div className="mt-8 flex flex-col gap-3 border-t border-white/8 pt-6 sm:flex-row">
            <Button
              href={plan.ctaHref}
              external={plan.ctaExternal}
              className="block flex-1 text-center"
              onClick={() => {
                // Carry the plan to the destination so the enquiry arrives
                // qualified rather than anonymous.
                setPlanIntent(qualifiedName);
                trackEvent("pricing_cta_click", {
                  plan: plan.id,
                  category: category.id,
                  price: plan.price,
                  destination: plan.ctaHref,
                  source: "plan_modal",
                });
              }}
            >
              {plan.ctaLabel}
            </Button>
            <Button
              href={whatsappLink}
              external
              variant="secondary"
              className="block flex-1 text-center"
              onClick={() =>
                trackEvent("whatsapp_click", {
                  source: "plan_modal",
                  plan: plan.id,
                })
              }
            >
              Ask a Question
            </Button>
          </div>

          <p className="mt-4 text-xs leading-relaxed text-text-muted">
            Payment is required in advance to confirm your booking. Plans begin
            once payment is confirmed.
          </p>
        </div>
      )}
    </Modal>
  );
}
