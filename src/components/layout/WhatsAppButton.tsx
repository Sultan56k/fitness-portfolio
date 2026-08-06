"use client";

import { motion } from "motion/react";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";
import { siteConfig } from "@/data/site";
import { getWhatsAppLink } from "@/lib/utils";
import { trackEvent } from "@/lib/analytics";

export function WhatsAppButton() {
  const whatsappLink = getWhatsAppLink(
    siteConfig.social.whatsapp.number,
    siteConfig.social.whatsapp.message,
  );

  return (
    <motion.a
      href={whatsappLink}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      title="Chat with us"
      onClick={() => trackEvent("whatsapp_click", { source: "floating_button" })}
      className="group fixed bottom-6 right-6 z-50 inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg shadow-black/30"
      // Bounces in after the hero has settled, per §7.3.
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{
        delay: 2,
        type: "spring",
        stiffness: 260,
        damping: 14,
      }}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.95 }}
    >
      {/* Continuously expanding ring to draw the eye. */}
      <span
        className="absolute inset-0 rounded-full bg-[#25D366] animate-pulse-ring"
        aria-hidden="true"
      />
      <WhatsAppIcon className="relative h-7 w-7" aria-hidden="true" />

      {/* Tooltip on hover (desktop only — hidden from the a11y tree since
          the link already has an accessible name). */}
      <span
        className="pointer-events-none absolute right-full mr-3 hidden whitespace-nowrap rounded-md bg-bg-elevated px-3 py-1.5 text-xs font-medium text-white opacity-0 shadow-lg transition-opacity duration-200 group-hover:opacity-100 md:block"
        aria-hidden="true"
      >
        Chat with us
      </span>
    </motion.a>
  );
}
