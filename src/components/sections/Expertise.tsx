"use client";

import { motion } from "motion/react";
import { siteConfig } from "@/data/site";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { RevealGroup } from "@/components/motion/Reveal";
import { ScrollScene } from "@/components/motion/Parallax";

/**
 * Signature entrance: the whole block scales up into focus out of a blur as
 * it enters, then the specialization pills burst in individually with a
 * rotate-and-overshoot pop.
 */
export function Expertise() {
  return (
    <section
      id="expertise"
      className="relative overflow-hidden border-b border-white/8 py-24 md:py-32"
      aria-labelledby="expertise-heading"
    >
      <div className="section-container">
        <ScrollScene from={0.9} blur>
          <SectionHeading
            id="expertise-heading"
            label="Specializations"
            title="Expertise"
            subtitle="Areas where we deliver proven results for every client."
          />

          <RevealGroup
            as="ul"
            className="mt-10 flex list-none flex-wrap gap-3 p-0"
            stagger={0.06}
          >
            {siteConfig.expertise.map((item, index) => (
              <motion.li
                key={item}
                variants={{
                  // Alternating spin direction keeps a long pill row from
                  // reading as one mechanical sweep.
                  hidden: {
                    opacity: 0,
                    scale: 0.4,
                    rotate: index % 2 === 0 ? -14 : 14,
                    y: 30,
                  },
                  visible: {
                    opacity: 1,
                    scale: 1,
                    rotate: 0,
                    y: 0,
                    transition: {
                      type: "spring",
                      stiffness: 260,
                      damping: 16,
                      mass: 0.6,
                    },
                  },
                }}
              >
                <motion.span
                  className="inline-block cursor-default rounded-full border border-accent-lime/30 bg-bg-elevated px-5 py-2.5 text-sm font-medium text-accent-lime transition-colors duration-300 hover:border-accent-lime hover:bg-accent-lime hover:text-bg-primary"
                  whileHover={{ scale: 1.12, y: -6 }}
                  whileTap={{ scale: 0.96 }}
                  transition={{ type: "spring", stiffness: 340, damping: 17 }}
                >
                  {item}
                </motion.span>
              </motion.li>
            ))}
          </RevealGroup>
        </ScrollScene>
      </div>
    </section>
  );
}
