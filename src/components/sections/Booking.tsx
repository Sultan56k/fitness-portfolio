"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion, useScroll, useTransform } from "motion/react";
import { Check, Clock, Video } from "lucide-react";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";
import { siteConfig } from "@/data/site";
import { formatPrice, getWhatsAppLink } from "@/lib/utils";
import { setPlanIntent } from "@/lib/planIntent";
import { trackEvent } from "@/lib/analytics";
import { Button } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/motion/Reveal";
import { Magnetic } from "@/components/motion/Magnetic";
import { EASE_OUT_EXPO } from "@/components/motion/variants";

const { options, fallback } = siteConfig.booking;

/**
 * `siteConfig` is `as const`, so a bare `useState(options[1].id)` would infer
 * the single literal `"30min"` and reject every other tab. This is the union
 * of all three ids.
 */
type OptionId = (typeof options)[number]["id"];

/**
 * Session booking, presented as three duration tabs over a single panel.
 *
 * Four side-by-side cards forced a visitor to compare three paid tiers and a
 * free one simultaneously, which flattened the decision. Tabs make the choice
 * sequential — pick a length, then read what it covers — and give each session
 * the full panel width for its detail rather than a cramped column.
 *
 * All three book through the same Calendly event; the duration is scope and
 * price, not a separate event type.
 */
export function Booking() {
  const sectionRef = useRef<HTMLElement>(null);
  // Defaults to the 30-minute session — the middle tier and the one most
  // people want, so the panel opens on a sensible answer rather than the
  // cheapest or the most expensive.
  const [activeId, setActiveId] = useState<OptionId>(options[1]!.id);
  const active = options.find((option) => option.id === activeId) ?? options[0]!;

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const orbScale = useTransform(scrollYProgress, [0, 0.5, 1], [0.6, 1.25, 0.6]);
  const orbOpacity = useTransform(scrollYProgress, [0, 0.5, 1], [0.3, 1, 0.3]);

  const whatsappLink = getWhatsAppLink(
    siteConfig.social.whatsapp.number,
    siteConfig.social.whatsapp.message,
  );

  return (
    <section
      ref={sectionRef}
      id="booking"
      className="relative overflow-hidden border-b border-white/8 py-24 md:py-32"
      aria-labelledby="booking-heading"
    >
      <motion.div
        className="glow-orb left-1/2 top-1/4 h-[500px] w-[500px] -translate-x-1/2 bg-accent-orange/10"
        style={{ scale: orbScale, opacity: orbOpacity }}
        aria-hidden="true"
      />

      <div className="section-container relative z-10">
        <SectionHeading
          id="booking-heading"
          label="Get Started"
          title={siteConfig.booking.title}
          subtitle={siteConfig.booking.subtitle}
          align="center"
          className="mx-auto"
        />

        <Reveal preset="fade-up" className="mx-auto mt-12 max-w-3xl">
          {/* Roving-tabindex tablist: one tab stop for the whole group, arrow
              keys move between tabs. Matches the WAI-ARIA tabs pattern rather
              than leaving three separate tab stops in the way. */}
          <div
            role="tablist"
            aria-label="Session length"
            className="mx-auto flex w-full max-w-xl rounded-full border border-white/10 bg-bg-elevated/60 p-1.5 backdrop-blur"
            onKeyDown={(event) => {
              const index = options.findIndex((o) => o.id === activeId);
              const delta =
                event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;
              if (!delta) return;
              event.preventDefault();
              // Wraps at both ends so the group never dead-ends.
              const next =
                options[(index + delta + options.length) % options.length]!;
              setActiveId(next.id);
              document.getElementById(`booking-tab-${next.id}`)?.focus();
            }}
          >
            {options.map((option) => {
              const selected = option.id === activeId;
              return (
                <button
                  key={option.id}
                  id={`booking-tab-${option.id}`}
                  role="tab"
                  type="button"
                  aria-selected={selected}
                  aria-controls={`booking-panel-${option.id}`}
                  tabIndex={selected ? 0 : -1}
                  onClick={() => setActiveId(option.id)}
                  className="relative flex-1 rounded-full px-3 py-2.5 text-sm font-semibold transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-lime/60"
                >
                  {/* Shared layoutId slides the pill between tabs instead of
                      cross-fading, so the selection reads as one object. */}
                  {selected && (
                    <motion.span
                      layoutId="booking-tab-pill"
                      className="absolute inset-0 rounded-full bg-accent-lime"
                      transition={{ type: "spring", stiffness: 380, damping: 32 }}
                      aria-hidden="true"
                    />
                  )}
                  <span
                    className={
                      selected
                        ? "relative z-10 text-bg-primary"
                        : "relative z-10 text-text-secondary hover:text-white"
                    }
                  >
                    {option.duration}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="glass-panel relative mt-6 overflow-hidden p-8 md:p-10">
            {/* Accent wash keyed to the panel, not the page — gives the
                selected session its own sense of place. */}
            <div
              className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-accent-lime/10 blur-3xl"
              aria-hidden="true"
            />

            <AnimatePresence mode="wait">
              <motion.div
                key={active.id}
                id={`booking-panel-${active.id}`}
                role="tabpanel"
                aria-labelledby={`booking-tab-${active.id}`}
                tabIndex={0}
                className="relative focus:outline-none"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.35, ease: [...EASE_OUT_EXPO] }}
              >
                <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="inline-flex items-center gap-2 rounded-full border border-accent-cyan/30 bg-accent-cyan/5 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-accent-cyan">
                      <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                      {active.duration}
                    </p>
                    <h3 className="mt-3 font-display text-3xl tracking-wide text-white">
                      {active.label}
                    </h3>
                  </div>
                  <p className="flex shrink-0 items-baseline gap-2">
                    <span className="font-display text-4xl tracking-wide text-accent-lime">
                      {siteConfig.pricing.currency} {formatPrice(active.price)}
                    </span>
                    <span className="text-sm text-text-muted">per session</span>
                  </p>
                </div>

                <p className="mt-5 text-sm leading-relaxed text-text-secondary md:text-base">
                  {active.description}
                </p>

                <ul className="mt-6 list-none space-y-3 p-0">
                  {active.bestFor.map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <Check
                        className="mt-0.5 h-4 w-4 shrink-0 text-accent-lime"
                        aria-hidden="true"
                      />
                      <span className="text-sm text-text-secondary">{item}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-8 flex flex-col items-center gap-4 border-t border-white/8 pt-6 sm:flex-row sm:justify-between">
                  <p className="order-2 flex items-center gap-2 text-xs text-text-muted sm:order-1">
                    <Video className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    WhatsApp video, Zoom, or Google Meet
                  </p>
                  <Magnetic className="order-1 w-full sm:order-2 sm:w-auto" strength={8}>
                    <Button
                      href={siteConfig.calendly.booking}
                      external
                      className="block w-full text-center sm:w-auto"
                      onClick={() => {
                        // A booked session is a qualified lead too — carry it
                        // so a later enquiry is not anonymous.
                        setPlanIntent(
                          `Consultancy — ${active.label} (${active.duration})`,
                        );
                        trackEvent("booking_calendly_click", {
                          source: "booking_section",
                          option: active.id,
                          price: active.price,
                        });
                      }}
                    >
                      {active.cta}
                    </Button>
                  </Magnetic>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="mt-6 flex flex-col items-center justify-center gap-3 text-sm sm:flex-row">
            <p className="text-text-muted">{fallback.prompt}</p>
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() =>
                trackEvent("whatsapp_click", { source: "booking_fallback" })
              }
              className="inline-flex items-center gap-2 rounded-full border border-[#25D366]/40 px-4 py-2 font-semibold text-[#25D366] transition-colors duration-300 hover:bg-[#25D366] hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366]/50"
            >
              <WhatsAppIcon className="h-4 w-4" aria-hidden="true" />
              {fallback.cta}
            </a>
          </div>

          <p className="mt-6 text-center text-xs text-text-muted">
            Payment is required in advance to confirm the slot.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
