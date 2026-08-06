"use client";

import { Check, Target, TrendingUp } from "lucide-react";
import { siteConfig, type Service } from "@/data/site";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { getWhatsAppLink } from "@/lib/utils";
import { trackEvent } from "@/lib/analytics";

interface ServiceDetailModalProps {
  service: Service | null;
  onClose: () => void;
}

/**
 * The destination for "Learn More" on a service card.
 *
 * Previously that button scrolled to the booking section — it promised detail
 * the page never delivered, so the click was a dead end dressed as a feature.
 * This renders the real per-service content from `site.ts` and closes with the
 * two actions a convinced visitor actually wants: book, or ask a question.
 */
export function ServiceDetailModal({
  service,
  onClose,
}: ServiceDetailModalProps) {
  // Keep the dialog mounted through its exit animation; `open` drives presence.
  const open = service !== null;

  const whatsappLink = service
    ? getWhatsAppLink(
        siteConfig.social.whatsapp.number,
        `Hi! I'd like to know more about ${service.title}.`,
      )
    : "";

  return (
    <Modal open={open} onClose={onClose} title={service?.title ?? ""}>
      {service && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-lime">
            Service
          </p>
          <h2 className="mt-2 pr-10 font-display text-3xl tracking-wide text-white md:text-4xl">
            {service.title}
          </h2>

          <p className="mt-4 text-sm leading-relaxed text-text-secondary md:text-base">
            {service.detail.intro}
          </p>

          <h3 className="mt-8 text-sm font-semibold uppercase tracking-wider text-white">
            What&apos;s included
          </h3>
          <ul className="mt-4 list-none space-y-3 p-0">
            {service.detail.includes.map((item) => (
              <li key={item} className="flex items-start gap-3">
                <Check
                  className="mt-0.5 h-4 w-4 shrink-0 text-accent-lime"
                  aria-hidden="true"
                />
                <span className="text-sm text-text-secondary">{item}</span>
              </li>
            ))}
          </ul>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-white/10 bg-bg-elevated/60 p-4">
              <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-accent-cyan">
                <Target className="h-3.5 w-3.5" aria-hidden="true" />
                Best for
              </p>
              <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                {service.detail.bestFor}
              </p>
            </div>
            <div className="rounded-xl border border-white/10 bg-bg-elevated/60 p-4">
              <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-accent-orange">
                <TrendingUp className="h-3.5 w-3.5" aria-hidden="true" />
                What to expect
              </p>
              <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                {service.detail.outcome}
              </p>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3 border-t border-white/8 pt-6 sm:flex-row">
            {/* Routes to this service's own pricing block rather than a
                generic booking link — a visitor convinced by the detail wants
                the tiers for what they just read, not the calendar. */}
            <Button
              href={service.planHref}
              className="block flex-1 text-center"
              onClick={() => {
                trackEvent("service_detail_open", {
                  service: service.id,
                  action: "view_plans",
                });
                onClose();
              }}
            >
              View Plans &amp; Pricing
            </Button>
            <Button
              href={whatsappLink}
              external
              variant="secondary"
              className="block flex-1 text-center"
              onClick={() =>
                trackEvent("whatsapp_click", {
                  source: "service_modal",
                  service: service.id,
                })
              }
            >
              Ask a Question
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
