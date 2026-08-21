"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Instagram, Menu, X } from "lucide-react";
import { siteConfig } from "@/data/site";
import { cn } from "@/lib/utils";
import { trackEvent } from "@/lib/analytics";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 80);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    if (isOpen) window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen]);

  const closeMenu = () => setIsOpen(false);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b transition-colors duration-300",
        isScrolled
          ? "border-white/8 bg-bg-primary/95 backdrop-blur-md"
          : "border-transparent bg-transparent",
      )}
    >
      {/* Grows with the logo: the lockup steps to h-14/h-16 at md/lg, which
          would clip against the old flat h-20. Each step keeps ~12px of
          breathing room above and below the mark. */}
      <div className="section-container flex h-20 items-center justify-between md:h-24 lg:h-28">
        <Link
          href="/#home"
          className="relative z-50 flex shrink-0 items-center"
          onClick={closeMenu}
          aria-label={`${siteConfig.brand.name} — home`}
        >
          {/* The -dark variant, not the raw supplied file: the original has
              near-black #2B2A28 wordmark text meant for a white background,
              which is all but invisible on the #15181e header. It is also
              pre-trimmed of ~190px of transparent right padding, so the glyphs
              fill the height they are given instead of scaling empty space.
              Intrinsic 685x196; width auto keeps the 3.49:1 ratio off height. */}
          <Image
            src="/brand/logo-lockup-dark.png"
            alt={`${siteConfig.brand.name} — ${siteConfig.brand.tagline}`}
            width={685}
            height={196}
            priority
            // ~230px wide at the h-16 step; 288 covers 1.25x DPR headroom.
            sizes="288px"
            className="h-11 w-auto sm:h-12 md:h-14 lg:h-16"
          />
        </Link>

        {/* gap tightens at lg: eight links plus the CTA cluster overflow a
            1024px viewport at the original gap-8. */}
        <nav
          className="hidden items-center gap-4 lg:flex xl:gap-8"
          aria-label="Main navigation"
        >
          {siteConfig.navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="group relative text-sm font-medium text-text-secondary transition-colors hover:text-accent-lime"
            >
              {link.label}
              <span className="absolute -bottom-1 left-0 h-0.5 w-0 bg-accent-lime transition-all duration-300 group-hover:w-full" />
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-4 lg:flex">
          <a
            href={siteConfig.social.instagram}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Follow us on Instagram ${siteConfig.social.instagramHandle}`}
            onClick={() => trackEvent("instagram_click", { source: "navbar" })}
            className="text-text-secondary transition-colors hover:text-accent-cyan"
          >
            <Instagram className="h-5 w-5" />
          </a>
          <Link
            href="/#booking"
            className="btn-primary rounded-full px-5 py-2.5 text-sm font-semibold text-white"
          >
            Book Now
          </Link>
        </div>

        <button
          type="button"
          className="relative z-50 inline-flex items-center justify-center rounded-md p-2 text-white lg:hidden"
          aria-expanded={isOpen}
          aria-controls="mobile-menu"
          aria-label={isOpen ? "Close menu" : "Open menu"}
          onClick={() => setIsOpen((prev) => !prev)}
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Full-screen mobile overlay */}
      <div
        id="mobile-menu"
        className={cn(
          "fixed inset-0 z-40 flex flex-col bg-bg-primary/98 backdrop-blur-lg transition-all duration-300 lg:hidden",
          isOpen
            ? "visible opacity-100"
            : "invisible opacity-0 pointer-events-none",
        )}
        aria-hidden={!isOpen}
      >
        {/* Eight links at the original text-4xl overflow a short phone, so the
            drawer scrolls and the type steps up only where there's room. */}
        <nav
          className="flex flex-1 flex-col items-center justify-center gap-1 overflow-y-auto py-20"
          aria-label="Mobile navigation"
        >
          {siteConfig.navLinks.map((link, index) => (
            <Link
              key={link.href}
              href={link.href}
              className="font-display text-3xl tracking-wide text-white transition-colors hover:text-accent-lime sm:text-4xl"
              style={{ transitionDelay: isOpen ? `${index * 50}ms` : "0ms" }}
              onClick={closeMenu}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex flex-col items-center gap-4 pb-12">
          <a
            href={siteConfig.social.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-text-secondary transition-colors hover:text-accent-cyan"
            onClick={() => {
              trackEvent("instagram_click", { source: "mobile_menu" });
              closeMenu();
            }}
          >
            <Instagram className="h-5 w-5" />
            {siteConfig.social.instagramHandle}
          </a>
          <Link
            href="/#booking"
            className="btn-primary rounded-full px-8 py-3 text-sm font-semibold text-white"
            onClick={closeMenu}
          >
            Book Now
          </Link>
        </div>
      </div>
    </header>
  );
}
