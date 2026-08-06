"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { siteConfig } from "@/data/site";

/**
 * Route-level error boundary.
 *
 * Without this, an exception in any client component — a WebGL failure in the
 * hero, a bad scroll target, a render throw — took down the whole page to a
 * blank screen. This contains the damage to the route and, critically, keeps
 * the WhatsApp and booking routes reachable so a crash does not cost a lead.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Server-rendered errors carry a digest; the message is scrubbed in
    // production, so the digest is the only way to correlate with server logs.
    console.error("[error boundary]", error.digest ?? error.message);
  }, [error]);

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 py-24 text-center">
      <div className="inline-flex h-16 w-16 items-center justify-center rounded-full border border-accent-orange/30 bg-accent-orange/10 text-accent-orange">
        <AlertTriangle className="h-8 w-8" aria-hidden="true" />
      </div>

      <h1 className="mt-6 font-display text-4xl tracking-wide text-white md:text-5xl">
        {siteConfig.errorPage.title}
      </h1>
      <p className="mt-4 max-w-md text-text-secondary">
        {siteConfig.errorPage.message}
      </p>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={reset}
          className="btn-primary inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white"
        >
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          {siteConfig.errorPage.retry}
        </button>
        <Link
          href="/"
          className="rounded-full border border-accent-lime/60 px-6 py-3 text-sm font-semibold text-accent-lime transition-colors hover:bg-accent-lime hover:text-bg-primary"
        >
          {siteConfig.errorPage.home}
        </Link>
      </div>

      <p className="mt-10 text-sm text-text-muted">
        Need to reach us directly?{" "}
        <a
          href={`mailto:${siteConfig.brand.email}`}
          className="text-accent-lime underline-offset-4 hover:underline"
        >
          {siteConfig.brand.email}
        </a>
      </p>

      {error.digest && (
        <p className="mt-3 font-mono text-xs text-text-muted/60">
          Reference: {error.digest}
        </p>
      )}
    </div>
  );
}
