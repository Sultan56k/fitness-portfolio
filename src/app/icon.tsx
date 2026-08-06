import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

/**
 * Generated favicon — lime "F" monogram on the brand dark background.
 * Replace with the client's real logo once provided (§18 item 2).
 */
export default function Icon() {
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
          fontSize: 24,
          fontWeight: 700,
          borderRadius: 6,
        }}
      >
        F
      </div>
    ),
    size,
  );
}
