"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";
import { X } from "lucide-react";
import { EASE_OUT_EXPO } from "@/components/motion/variants";
import { cn } from "@/lib/utils";

/** Elements that can hold focus — the set the focus trap cycles through. */
const FOCUSABLE =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  /** Accessible name. Rendered as the visible heading. */
  title: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * Accessible dialog used by the service detail and class video modals.
 *
 * Handles the full contract rather than just visual overlay: focus moves in on
 * open and returns to the trigger on close, Tab is trapped inside, Escape and
 * backdrop clicks dismiss, and background scroll is locked — including Lenis,
 * which drives its own scroll loop and would otherwise keep scrolling the page
 * behind the dialog.
 */
export function Modal({
  open,
  onClose,
  title,
  children,
  className,
}: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  /** The element focused before opening, so focus can be handed back. */
  const triggerRef = useRef<HTMLElement | null>(null);
  /**
   * Portals need a DOM target that does not exist during SSR. Gating on a
   * state flag set in an effect — rather than a bare `typeof document` check —
   * guarantees the first client render matches the server's empty output, so
   * React never reports a hydration mismatch.
   */
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== "Tab") return;

      const panel = panelRef.current;
      if (!panel) return;

      const focusable = Array.from(
        panel.querySelectorAll<HTMLElement>(FOCUSABLE),
      ).filter((el) => el.offsetParent !== null);
      if (focusable.length === 0) {
        // Nothing to cycle through — keep focus on the panel itself.
        event.preventDefault();
        panel.focus();
        return;
      }

      const first = focusable[0]!;
      const last = focusable[focusable.length - 1]!;
      const active = document.activeElement;

      // Wrap at both ends so Tab never escapes into the page behind.
      if (event.shiftKey && (active === first || active === panel)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    },
    [onClose],
  );

  useEffect(() => {
    if (!open) return;

    triggerRef.current = document.activeElement as HTMLElement | null;

    // Lenis reads this attribute and stops driving the page while it is set;
    // overflow:hidden alone does not stop a JS-driven scroll loop.
    const root = document.documentElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    root.classList.add("modal-open");

    document.addEventListener("keydown", handleKeyDown);

    // Focus the panel on the next frame, once it has actually mounted.
    const frame = requestAnimationFrame(() => panelRef.current?.focus());

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      cancelAnimationFrame(frame);
      document.body.style.overflow = previousOverflow;
      root.classList.remove("modal-open");
      // Return focus to whatever opened the dialog.
      triggerRef.current?.focus?.();
    };
  }, [open, handleKeyDown]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-end justify-center p-0 sm:items-center sm:p-6"
          role="presentation"
        >
          <motion.div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            aria-hidden="true"
          />

          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label={title}
            tabIndex={-1}
            className={cn(
              "glass-panel relative z-10 max-h-[88vh] w-full overflow-y-auto rounded-b-none p-6 outline-none sm:max-w-2xl sm:rounded-2xl md:p-8",
              className,
            )}
            initial={{ opacity: 0, y: 40, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.98 }}
            transition={{ duration: 0.45, ease: [...EASE_OUT_EXPO] }}
          >
            <button
              type="button"
              onClick={onClose}
              aria-label="Close dialog"
              className="absolute right-4 top-4 z-20 rounded-full border border-white/10 bg-bg-elevated/80 p-2 text-text-secondary transition-colors hover:border-white/25 hover:text-white focus:outline-none focus:ring-2 focus:ring-accent-lime/50"
            >
              <X className="h-4 w-4" />
            </button>

            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
