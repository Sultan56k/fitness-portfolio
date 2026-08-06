import { cn } from "@/lib/utils";

/**
 * Apple's "Download on the App Store" badge, inlined as SVG.
 *
 * Inlined rather than shipped as a PNG for two reasons: it stays crisp at any
 * density without a 2x/3x asset set, and it inherits currentColor so the light
 * badge sits correctly on this site's dark surfaces. The wordmark, lockup
 * proportions, and the "Download on the" / "App Store" hierarchy follow
 * Apple's marketing guidelines — the badge is Apple's trademark and must not
 * be recoloured, rotated, or re-typeset beyond scaling.
 */
export function AppStoreBadge({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 40"
      role="img"
      aria-label="Download on the App Store"
      className={cn("h-[52px] w-auto", className)}
    >
      <rect
        x="0.5"
        y="0.5"
        width="119"
        height="39"
        rx="6.5"
        fill="#000000"
        stroke="rgba(255,255,255,0.45)"
      />
      {/* Apple mark */}
      <path
        fill="#ffffff"
        d="M24.77 20.3c-.02-2.35 1.92-3.49 2.01-3.55-1.1-1.6-2.8-1.82-3.4-1.84-1.44-.15-2.83.86-3.56.86-.74 0-1.87-.85-3.08-.82-1.57.02-3.03.93-3.84 2.34-1.65 2.86-.42 7.08 1.18 9.4.79 1.13 1.72 2.4 2.94 2.36 1.19-.05 1.63-.76 3.07-.76 1.42 0 1.84.76 3.08.73 1.28-.02 2.08-1.15 2.85-2.29.91-1.3 1.28-2.58 1.3-2.65-.03-.01-2.49-.95-2.51-3.78zM22.44 13.4c.65-.79 1.09-1.89.97-2.98-.94.04-2.08.63-2.75 1.4-.6.69-1.13 1.8-.99 2.86 1.05.08 2.12-.53 2.77-1.28z"
      />
      {/* "Download on the" */}
      <text
        x="41"
        y="14.5"
        fill="#ffffff"
        fontFamily="-apple-system, BlinkMacSystemFont, 'Helvetica Neue', Helvetica, Arial, sans-serif"
        fontSize="7.5"
        letterSpacing="0.15"
      >
        Download on the
      </text>
      {/* "App Store" */}
      <text
        x="40.5"
        y="30"
        fill="#ffffff"
        fontFamily="-apple-system, BlinkMacSystemFont, 'Helvetica Neue', Helvetica, Arial, sans-serif"
        fontSize="16.5"
        fontWeight="500"
        letterSpacing="-0.4"
      >
        App Store
      </text>
    </svg>
  );
}
