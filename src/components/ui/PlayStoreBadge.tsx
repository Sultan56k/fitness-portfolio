import { cn } from "@/lib/utils";

/**
 * Google's "Get it on Google Play" badge, inlined as SVG.
 *
 * Built the same way as AppStoreBadge and for the same reasons: it stays crisp
 * at any density without a 2x/3x asset set, ships no image bytes, and sits
 * correctly on this site's dark surfaces. The four-colour triangular mark, the
 * "GET IT ON" / "Google Play" hierarchy, and the lockup proportions follow
 * Google's brand guidelines — the badge is Google's trademark and must not be
 * recoloured, rotated, or re-typeset beyond scaling.
 *
 * Sized to match the App Store badge's 120x40 viewBox so the two sit on one
 * optical baseline when rendered side by side.
 *
 * Both text runs carry an explicit `textLength` with `lengthAdjust` set to
 * "spacingAndGlyphs". Without it the rendered width depends on whichever font
 * the visitor's device actually resolves for the stack below — Roboto on
 * Android, something wider on a machine that has none of them — and the
 * wordmark overflows the rounded rect on exactly the devices we cannot test.
 * Pinning the width makes the lockup fit by construction on every device
 * rather than by luck of the installed fonts.
 */
export function PlayStoreBadge({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 40"
      role="img"
      aria-label="Get it on Google Play"
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

      {/*
        Play mark. The four faces share the apex points, so they are drawn as
        separate fills rather than one path with strokes — that keeps the seams
        exact at every scale instead of showing hairlines when the badge is
        rendered small.
      */}
      <g transform="translate(10.5 8.6) scale(0.0468)">
        {/* Left face — the folded "page" edge, blue. */}
        <path
          fill="#00A0FF"
          d="M22 15.6c-4 4.2-3.8 9.2-3.8 9.2v450.4s0 5 3.8 9.2l1.5 1.5 252.3-252.3v-5.9L23.5 375.4 22 373.9z"
        />
        {/* Top-right face, green. */}
        <path
          fill="#00E175"
          d="M359.9 316.4l-84.1-84.1v-5.9l84.2-84.2 1.9 1.1 99.7 56.6c28.5 16.2 28.5 42.7 0 58.9l-99.7 56.6z"
        />
        {/* Bottom face, red/orange. */}
        <path
          fill="#FF3A44"
          d="M361.8 315.3L275.8 229.3 22 483.1c9.4 9.9 24.9 11.1 42.4 1.2z"
        />
        {/* Top face, amber. */}
        <path
          fill="#FFC800"
          d="M361.8 143.3L64.4 15.3C46.9 5.4 31.4 6.6 22 16.5l253.8 253.8z"
        />
      </g>

      {/* "GET IT ON" — tracked out to sit optically flush with the wordmark. */}
      <text
        x="41"
        y="15"
        fill="#ffffff"
        fontFamily="Roboto, -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Helvetica, Arial, sans-serif"
        fontSize="7"
        letterSpacing="0.8"
        textLength="40"
        lengthAdjust="spacingAndGlyphs"
      >
        GET IT ON
      </text>
      {/*
        "Google Play". Set at 14 rather than the App Store badge's 16.5: this
        wordmark is eleven characters against that badge's nine, so matching
        the point size is what pushed it past the right edge of the rect.
        Width is pinned to 68, leaving a 10-unit gutter before the border.
      */}
      <text
        x="41"
        y="30.5"
        fill="#ffffff"
        fontFamily="Roboto, -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Helvetica, Arial, sans-serif"
        fontSize="14"
        fontWeight="500"
        letterSpacing="-0.2"
        textLength="68"
        lengthAdjust="spacingAndGlyphs"
      >
        Google Play
      </text>
    </svg>
  );
}
