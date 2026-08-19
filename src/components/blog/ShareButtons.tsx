"use client";

import { useState } from "react";
import { Check, Link2, Linkedin, Facebook } from "lucide-react";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";
import { trackEvent } from "@/lib/analytics";

/**
 * Share row for an article. The URL is passed in already-absolute from the
 * server: `window.location` would be empty during prerender, and building it
 * from the canonical origin keeps shared links free of any preview-deployment
 * or query-string noise.
 */
export function ShareButtons({ url, title }: { url: string; title: string }) {
  const [copied, setCopied] = useState(false);

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const targets = [
    {
      name: "WhatsApp",
      href: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
      Icon: WhatsAppIcon,
    },
    {
      name: "Facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      Icon: Facebook,
    },
    {
      name: "LinkedIn",
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      Icon: Linkedin,
    },
  ];

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      trackEvent("blog_share_click", { network: "copy_link", post: title });
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard is permission-gated and unavailable on insecure origins.
      // The share links beside this button still work, so failing quietly is
      // better than an alert the visitor cannot act on.
    }
  };

  const iconButton =
    "inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-text-secondary transition-colors duration-200 hover:border-accent-lime/40 hover:text-accent-lime";

  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className="text-sm font-medium text-text-muted">Share</span>

      {targets.map(({ name, href, Icon }) => (
        <a
          key={name}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Share on ${name}`}
          className={iconButton}
          onClick={() =>
            trackEvent("blog_share_click", { network: name, post: title })
          }
        >
          <Icon className="h-4 w-4" aria-hidden="true" />
        </a>
      ))}

      <button
        type="button"
        onClick={copyLink}
        aria-label="Copy link to this article"
        className={iconButton}
      >
        {copied ? (
          <Check className="h-4 w-4 text-accent-lime" aria-hidden="true" />
        ) : (
          <Link2 className="h-4 w-4" aria-hidden="true" />
        )}
      </button>

      {/* Announces the copy result without moving focus. */}
      <span role="status" aria-live="polite" className="sr-only">
        {copied ? "Link copied to clipboard" : ""}
      </span>
    </div>
  );
}
