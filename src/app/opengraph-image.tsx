import { ImageResponse } from "next/og";
import { siteConfig } from "@/data/site";

export const runtime = "edge";
export const alt = `${siteConfig.brand.name} — ${siteConfig.brand.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Generated OG image (§16) — avoids shipping a static og-image.jpg and keeps
 * the preview in sync with site.ts automatically.
 */
export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background:
            "linear-gradient(135deg, #15181E 0%, #1C2028 55%, #272C36 100%)",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 28,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: "#FF6B35",
            fontWeight: 600,
          }}
        >
          Fitness · Health · Nutrition
        </div>

        <div
          style={{
            display: "flex",
            marginTop: 28,
            fontSize: 84,
            lineHeight: 1.05,
            color: "#FFFFFF",
            fontWeight: 700,
            maxWidth: 900,
          }}
        >
          {siteConfig.brand.tagline}
        </div>

        <div
          style={{
            display: "flex",
            marginTop: 32,
            fontSize: 30,
            color: "#A8ADBA",
            maxWidth: 860,
          }}
        >
          {siteConfig.brand.name} — Diet coaching, strength training, and 1-on-1
          consultancy.
        </div>

        <div
          style={{
            position: "absolute",
            right: -120,
            top: -120,
            width: 460,
            height: 460,
            borderRadius: "50%",
            background: "rgba(255, 164, 92, 0.18)",
          }}
        />
        <div
          style={{
            position: "absolute",
            right: 40,
            bottom: -140,
            width: 380,
            height: 380,
            borderRadius: "50%",
            background: "rgba(255, 217, 160, 0.16)",
          }}
        />
      </div>
    ),
    size,
  );
}
