"use client";

import { Instagram, Mail, Smartphone } from "lucide-react";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";
import { siteConfig } from "@/data/site";
import { getWhatsAppLink } from "@/lib/utils";
import { trackEvent } from "@/lib/analytics";

const linkStyles =
  "inline-flex items-center gap-2 text-sm text-text-secondary transition-colors hover:text-accent-cyan";

/**
 * The footer's outbound contact links, split into a client component purely so
 * the conversion clicks can be measured — the rest of the Footer stays a server
 * component and ships no JS.
 */
export function FooterContactLinks() {
  const whatsappLink = getWhatsAppLink(
    siteConfig.social.whatsapp.number,
    siteConfig.social.whatsapp.message,
  );

  return (
    <ul className="mt-4 space-y-3">
      <li>
        <a
          href={`mailto:${siteConfig.brand.email}`}
          className={linkStyles}
          onClick={() => trackEvent("email_click", { source: "footer" })}
        >
          <Mail className="h-4 w-4" aria-hidden="true" />
          {siteConfig.brand.email}
        </a>
      </li>
      <li>
        <a
          href={siteConfig.social.instagram}
          target="_blank"
          rel="noopener noreferrer"
          className={linkStyles}
          onClick={() => trackEvent("instagram_click", { source: "footer" })}
        >
          <Instagram className="h-4 w-4" aria-hidden="true" />
          {siteConfig.social.instagramHandle}
        </a>
      </li>
      <li>
        <a
          href={whatsappLink}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm text-text-secondary transition-colors hover:text-accent-lime"
          onClick={() => trackEvent("whatsapp_click", { source: "footer" })}
        >
          <WhatsAppIcon className="h-4 w-4" aria-hidden="true" />
          WhatsApp Chat
        </a>
      </li>
      <li>
        <a
          href={siteConfig.app.url}
          target="_blank"
          rel="noopener noreferrer"
          className={linkStyles}
          onClick={() => trackEvent("app_store_click", { source: "footer" })}
        >
          <Smartphone className="h-4 w-4" aria-hidden="true" />
          {siteConfig.app.name} on iOS
        </a>
      </li>
    </ul>
  );
}
