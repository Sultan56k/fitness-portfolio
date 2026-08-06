"use client";

import { useRef, useState } from "react";
import { motion, useScroll, useSpring, useTransform } from "motion/react";
import { Play } from "lucide-react";
import { siteConfig } from "@/data/site";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getWhatsAppLink } from "@/lib/utils";
import { Reveal } from "@/components/motion/Reveal";
import { Magnetic } from "@/components/motion/Magnetic";
import { ClassVideoModal } from "./ClassVideoModal";
import { trackEvent } from "@/lib/analytics";

/**
 * Signature entrance: the preview panel wipes open from the left behind a
 * clip edge while the copy column blur-resolves, and the panel's inner
 * gradient counter-scrolls for parallax depth inside the frame.
 */
export function OnlineClasses() {
  const sectionRef = useRef<HTMLElement>(null);
  const [videoOpen, setVideoOpen] = useState(false);

  function openVideo() {
    trackEvent("class_video_open", {
      has_video: Boolean(siteConfig.classes.video.url),
    });
    setVideoOpen(true);
  }

  const whatsappLink = getWhatsAppLink(
    siteConfig.social.whatsapp.number,
    "Hi! I'd like to join an online fitness class.",
  );

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  // Inner-gradient parallax. Scaled up so the panel never reveals an edge
  // as the layer travels.
  const innerY = useSpring(useTransform(scrollYProgress, [0, 1], [-40, 40]), {
    stiffness: 120,
    damping: 30,
  });
  const panelRotate = useTransform(scrollYProgress, [0, 0.5, 1], [4, 0, -4]);

  return (
    <section
      ref={sectionRef}
      id="classes"
      className="relative overflow-hidden border-b border-white/8 bg-bg-secondary py-24 md:py-32"
      aria-labelledby="classes-heading"
    >
      <div className="section-container grid gap-10 lg:grid-cols-2 lg:items-center">
        <Reveal preset="clip-left" amount={0.25}>
          <motion.div
            style={{
              rotate: panelRotate,
              transformPerspective: 1200,
            }}
          >
            <Card
              hover={false}
              className="relative flex aspect-video items-center justify-center overflow-hidden p-0"
            >
              <motion.div
                className="absolute inset-0 scale-125 bg-gradient-to-br from-bg-elevated via-bg-secondary to-bg-primary"
                style={{ y: innerY }}
                aria-hidden="true"
              />
              <div className="relative flex flex-col items-center">
                {/* A real button, not a decorated div. This previously had
                    hover/tap animations and pulse rings but no handler — it
                    looked interactive and did nothing, and was unreachable by
                    keyboard. */}
                <motion.button
                  type="button"
                  onClick={openVideo}
                  aria-haspopup="dialog"
                  aria-label="Play the online class preview"
                  className="group relative flex h-16 w-16 items-center justify-center rounded-full border border-white/20 bg-white/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-lime focus-visible:ring-offset-2 focus-visible:ring-offset-bg-secondary"
                  whileHover={{ scale: 1.18 }}
                  whileTap={{ scale: 0.94 }}
                  transition={{ type: "spring", stiffness: 300, damping: 18 }}
                >
                  {/* Pulsing rings behind the play button, offset so the
                      expansion reads as continuous rather than a single beat. */}
                  <span
                    className="absolute inset-0 rounded-full border border-accent-lime/40 animate-pulse-ring"
                    aria-hidden="true"
                  />
                  <span
                    className="absolute inset-0 rounded-full border border-accent-cyan/30 animate-pulse-ring [animation-delay:1.25s]"
                    aria-hidden="true"
                  />
                  <Play
                    className="ml-1 h-7 w-7 fill-white text-white"
                    aria-hidden="true"
                  />
                </motion.button>
                <p className="mt-4 text-sm text-text-muted">
                  Online Class Preview
                </p>
              </div>
            </Card>
          </motion.div>
        </Reveal>

        <div>
          <SectionHeading
            id="classes-heading"
            label="Live Sessions"
            title="Online Fitness Classes"
            subtitle={siteConfig.classes.description}
          />
          <Reveal preset="blur" delay={0.2}>
            <motion.p
              className="mt-6 inline-flex items-center rounded-full border border-accent-cyan/30 bg-accent-cyan/5 px-4 py-2 text-sm font-medium text-accent-cyan"
              animate={{
                boxShadow: [
                  "0 0 0px rgba(255, 217, 160,0)",
                  "0 0 22px rgba(255, 217, 160,0.35)",
                  "0 0 0px rgba(255, 217, 160,0)",
                ],
              }}
              transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
            >
              {siteConfig.classes.schedule}
            </motion.p>
          </Reveal>
          <Reveal preset="fade-up" delay={0.35} className="mt-8">
            <Magnetic>
              <Button
                href={whatsappLink}
                external
                onClick={() =>
                  trackEvent("whatsapp_click", { source: "classes_join" })
                }
              >
                Join a Class
              </Button>
            </Magnetic>
          </Reveal>
        </div>
      </div>

      <ClassVideoModal open={videoOpen} onClose={() => setVideoOpen(false)} />
    </section>
  );
}
