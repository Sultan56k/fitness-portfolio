import { Dumbbell } from "lucide-react";
import { cn } from "@/lib/utils";

interface HeroSceneFallbackProps {
  animated?: boolean;
  className?: string;
}

/**
 * Static stand-in for the 3D hero — shown while the scene loads, and as the
 * permanent view when WebGL is unavailable or the user prefers reduced motion.
 * Mirrors the real scene's composition: centre object surrounded by rings.
 *
 * Fills its container rather than imposing a min-height, so it occupies exactly
 * the same full-bleed area as the canvas it stands in for and the layout never
 * shifts when the scene finishes loading. The service labels are rendered by
 * the hero itself (HeroHighlights), so they are deliberately absent here.
 */
export function HeroSceneFallback({
  animated = true,
  className,
}: HeroSceneFallbackProps) {
  return (
    <div
      className={cn(
        "relative flex h-full w-full items-center justify-center overflow-hidden",
        className,
      )}
      aria-hidden="true"
    >
      {/* Soft key from upper right, matching where the studio environment puts
          its main light — so the fallback and the real scene agree on the
          direction the light comes from. */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_68%_32%,rgba(42,50,68,0.9),rgba(13,15,22,0.4)_58%,transparent_78%)]" />

      {/* Matches the 3D framing: large, pushed right, cropped by the frame. */}
      <div className="relative lg:translate-x-[30%]">
        <div
          className={cn(
            "absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/[0.06] blur-3xl",
            animated && "animate-pulse-glow",
          )}
        />
        <div className="absolute left-1/2 top-1/2 h-56 w-56 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10" />
        <div className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full border border-accent-cyan/10" />

        {/* Steel-toned rather than glowing lime: this is the permanent view for
            reduced-motion and no-WebGL visitors, so it should read as the same
            product as the 3D scene, not as a neon icon. */}
        <Dumbbell
          className="relative h-40 w-40 -rotate-12 text-[#c8ceda] drop-shadow-[0_8px_28px_rgba(0,0,0,0.6)] md:h-52 md:w-52"
          strokeWidth={1}
        />
      </div>
    </div>
  );
}
