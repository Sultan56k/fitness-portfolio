"use client";

import { useEffect } from "react";

/**
 * Last-resort boundary for errors thrown in the root layout itself.
 *
 * This replaces the entire document, so it renders its own <html> and <body>
 * and cannot rely on the app's providers, fonts, or Tailwind classes — the
 * stylesheet may be exactly what failed to load. Everything here is inline.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[global error]", error.digest ?? error.message);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "1rem",
          padding: "2rem",
          textAlign: "center",
          // Hardcoded because the stylesheet may be what failed. Tracks
          // --color-bg-primary / --color-text-primary in globals.css.
          background: "#15181e",
          color: "#ffffff",
          fontFamily:
            "system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
        }}
      >
        <h1 style={{ fontSize: "1.75rem", margin: 0, letterSpacing: "0.02em" }}>
          Something went wrong
        </h1>
        <p style={{ color: "#8b8b9e", maxWidth: "28rem", margin: 0 }}>
          The page failed to load. Please try again.
        </p>
        <button
          type="button"
          onClick={reset}
          style={{
            marginTop: "0.5rem",
            border: "none",
            borderRadius: "9999px",
            padding: "0.75rem 1.75rem",
            fontSize: "0.875rem",
            fontWeight: 600,
            color: "#ffffff",
            background: "#ff6b35",
            cursor: "pointer",
          }}
        >
          Try Again
        </button>
        {error.digest && (
          <p style={{ color: "#5a5a6e", fontSize: "0.75rem", margin: 0 }}>
            Reference: {error.digest}
          </p>
        )}
      </body>
    </html>
  );
}
