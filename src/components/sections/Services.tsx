"use client";

import { useRef, useState } from "react";
import { motion, useScroll, useSpring, useTransform } from "motion/react";
import { Apple, ArrowRight, Dumbbell, User, type LucideIcon } from "lucide-react";
import { siteConfig, type Service } from "@/data/site";
import { Card } from "@/components/ui/Card";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { RevealGroup, RevealItem } from "@/components/motion/Reveal";
import { TiltCard } from "@/components/motion/TiltCard";
import { ServiceDetailModal } from "./ServiceDetailModal";
import { trackEvent } from "@/lib/analytics";

const iconMap: Record<Service["icon"], LucideIcon> = {
  apple: Apple,
  dumbbell: Dumbbell,
  user: User,
};

/**
 * Signature entrance: cards flip up from below on the X axis in a staggered
 * cascade, and each column carries its own scroll offset so the row arrives
 * as a wave rather than a flat bar.
 */
export function Services() {
  const sectionRef = useRef<HTMLElement>(null);
  // Which service's detail dialog is open. null = closed.
  const [activeService, setActiveService] = useState<Service | null>(null);

  function openService(service: Service) {
    trackEvent("service_detail_open", { service: service.id });
    setActiveService(service);
  }

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const orbY = useTransform(scrollYProgress, [0, 1], [-120, 120]);
  // Alternating column drift: even columns lag, odd columns lead.
  const laggingY = useSpring(useTransform(scrollYProgress, [0, 1], [60, -60]), {
    stiffness: 120,
    damping: 30,
  });
  const leadingY = useSpring(useTransform(scrollYProgress, [0, 1], [-30, 30]), {
    stiffness: 120,
    damping: 30,
  });

  return (
    <section
      ref={sectionRef}
      id="services"
      className="relative overflow-hidden border-b border-white/8 bg-bg-secondary py-24 md:py-32"
      aria-labelledby="services-heading"
    >
      <motion.div
        className="glow-orb -right-40 top-1/4 h-[400px] w-[400px] bg-accent-cyan/8"
        style={{ y: orbY }}
        aria-hidden="true"
      />

      <div className="section-container relative z-10">
        <SectionHeading
          id="services-heading"
          label="What We Offer"
          title="Our Services"
          subtitle="Three ways to work together — nutrition, strength, or direct 1-on-1 guidance."
        />

        <RevealGroup
          className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          stagger={0.14}
        >
          {siteConfig.services.map((service, index) => {
            const Icon = iconMap[service.icon];
            return (
              <RevealItem key={service.id} preset="flip" className="h-full">
                <motion.div
                  className="h-full"
                  style={{ y: index % 2 === 0 ? laggingY : leadingY }}
                >
                  <TiltCard className="h-full" max={10} lift={20}>
                    <Card as="article" className="h-full">
                      <motion.div
                        className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-accent-lime/10 text-accent-lime"
                        whileHover={{ rotate: 360, scale: 1.15 }}
                        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                      >
                        <Icon className="h-6 w-6" aria-hidden="true" />
                      </motion.div>
                      <h3 className="text-lg font-semibold text-white">
                        {service.title}
                      </h3>
                      <p className="mt-3 text-sm leading-relaxed text-text-secondary">
                        {service.description}
                      </p>
                      <div className="mt-4">
                        {/* Opens the real per-service detail dialog. This used
                            to link to #booking, which promised depth the page
                            did not have. */}
                        <button
                          type="button"
                          onClick={() => openService(service)}
                          aria-haspopup="dialog"
                          className="group/cta inline-flex items-center gap-1 rounded text-sm font-medium text-accent-lime transition-colors duration-300 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-lime/50"
                        >
                          Learn More
                          <ArrowRight
                            className="h-4 w-4 transition-transform group-hover/cta:translate-x-1"
                            aria-hidden="true"
                          />
                          <span className="sr-only">about {service.title}</span>
                        </button>
                      </div>
                    </Card>
                  </TiltCard>
                </motion.div>
              </RevealItem>
            );
          })}
        </RevealGroup>
      </div>

      <ServiceDetailModal
        service={activeService}
        onClose={() => setActiveService(null)}
      />
    </section>
  );
}
