"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { useReducedMotion } from "@/hooks/useReducedMotion";

/**
 * Wraps the app in Lenis smooth scroll. Disabled entirely under
 * prefers-reduced-motion so native scrolling (and scroll-behavior: auto)
 * takes over.
 *
 * Also publishes normalised scroll velocity to `--scroll-velocity` on the
 * root element, which CSS uses for the subtle page-wide skew during fast
 * flicks, and drives the `is-scrolling` class that suppresses hover-only
 * effects mid-scroll.
 */
export function SmoothScrollProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion) return;

    const lenis = new Lenis({
      // Slightly longer than default: the page is animation-heavy, and a
      // lazier glide gives each section entrance room to actually play.
      duration: 1.25,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 0.9,
      touchMultiplier: 1.6,
      lerp: 0.085,
    });

    const root = document.documentElement;
    let idleTimer: ReturnType<typeof setTimeout> | undefined;

    const onScroll = ({ velocity }: { velocity: number }) => {
      // Clamp hard — an unbounded velocity would shear the page apart on a
      // trackpad fling.
      const clamped = Math.max(-1, Math.min(1, velocity / 45));
      root.style.setProperty("--scroll-velocity", clamped.toFixed(4));

      root.classList.add("is-scrolling");
      if (idleTimer) clearTimeout(idleTimer);
      idleTimer = setTimeout(() => {
        root.classList.remove("is-scrolling");
        root.style.setProperty("--scroll-velocity", "0");
      }, 140);
    };

    lenis.on("scroll", onScroll);

    let frame = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    };
    frame = requestAnimationFrame(raf);

    // Anchor links (#booking, /#about…) should ease rather than jump.
    //
    // Both forms are matched: bare `#about` and root-relative `/#about`. The
    // latter is what nav links use so they also work from /privacy — there the
    // target is absent from the DOM, we bail without preventDefault, and Next
    // performs a real navigation home instead. Interception only ever happens
    // when the section genuinely exists on the current page.
    const onAnchorClick = (event: MouseEvent) => {
      // Let modified clicks (new tab, download, middle-click) behave natively.
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const anchor = (event.target as HTMLElement | null)?.closest?.(
        'a[href^="#"], a[href^="/#"]',
      ) as HTMLAnchorElement | null;
      if (!anchor) return;
      if (anchor.target && anchor.target !== "_self") return;

      const raw = anchor.getAttribute("href");
      if (!raw) return;

      const hash = raw.startsWith("/#") ? raw.slice(1) : raw;
      if (hash === "#") return;

      const target = document.querySelector(hash);
      if (!target) return; // cross-page link → let Next navigate

      event.preventDefault();
      // Keep the URL in sync so the section is linkable and Back works,
      // without the native jump that history.pushState avoids.
      window.history.pushState(null, "", hash);
      lenis.scrollTo(target as HTMLElement, {
        offset: -80,
        duration: 1.6,
        easing: (t: number) => 1 - Math.pow(1 - t, 4),
      });
    };

    document.addEventListener("click", onAnchorClick);

    // Modals lock background scrolling. `overflow: hidden` alone does not stop
    // Lenis, which drives scroll from its own rAF loop and would keep moving
    // the page behind an open dialog. The Modal toggles `.modal-open` on the
    // root element; mirror that into Lenis's own stop/start.
    const modalObserver = new MutationObserver(() => {
      if (root.classList.contains("modal-open")) lenis.stop();
      else lenis.start();
    });
    modalObserver.observe(root, {
      attributes: true,
      attributeFilter: ["class"],
    });

    // Landing on /#booking from another route: Lenis holds scroll at 0 and
    // suppresses the browser's native hash jump, so the section must be
    // sought explicitly once the homepage has mounted and laid out.
    let landingFrame = 0;
    if (window.location.hash.length > 1) {
      landingFrame = requestAnimationFrame(() => {
        const target = document.querySelector(window.location.hash);
        if (target) {
          lenis.scrollTo(target as HTMLElement, { offset: -80, immediate: true });
        }
      });
    }

    return () => {
      document.removeEventListener("click", onAnchorClick);
      modalObserver.disconnect();
      if (landingFrame) cancelAnimationFrame(landingFrame);
      if (idleTimer) clearTimeout(idleTimer);
      cancelAnimationFrame(frame);
      lenis.destroy();
      root.classList.remove("is-scrolling");
      root.style.removeProperty("--scroll-velocity");
    };
  }, [reducedMotion]);

  return <>{children}</>;
}
