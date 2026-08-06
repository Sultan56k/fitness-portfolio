import { ImageResponse } from "next/og";
import { siteConfig } from "@/data/site";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/**
 * apple-touch-icon — what iOS uses when the site is added to the home screen.
 * Was missing entirely, so iOS fell back to a screenshot of the page.
 *
 * Matches `icon.tsx` (orange monogram on the brand dark) but at 180px with no
 * corner radius, since iOS applies its own mask.
 */
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#15181E",
          color: "#FF6B35",
          fontSize: 120,
          fontWeight: 700,
        }}
      >
        {siteConfig.brand.name.charAt(0)}
      </div>
    ),
    size,
  );
}
