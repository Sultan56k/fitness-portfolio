"use client";

import { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { cn } from "@/lib/utils";

interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
  /** Maximum rotation in degrees at the corners. */
  max?: number;
  /** Lift toward the viewer while hovered. */
  lift?: number;
  /** Render the cursor-tracking sheen highlight. */
  glare?: boolean;
}

/**
 * Pointer-driven 3D tilt. The card rotates about its centre toward the
 * cursor and lifts slightly, with an optional radial sheen that tracks the
 * pointer for a glass-under-light feel.
 *
 * Mouse-only and disabled under reduced motion — on touch there is no
 * pointermove before the tap, so the card simply stays flat.
 */
export function TiltCard({
  children,
  className,
  max = 9,
  lift = 14,
  glare = true,
}: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  // Normalised pointer position within the card, -0.5 … 0.5 on each axis.
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  // Raw 0…100% pointer position, used to place the glare centre.
  const gx = useMotionValue(50);
  const gy = useMotionValue(50);

  // Drives the glare fade, so it only paints while the pointer is inside.
  const glareOpacity = useMotionValue(0);

  const spring = { stiffness: 200, damping: 22, mass: 0.4 };
  const rotateX = useSpring(useTransform(py, [-0.5, 0.5], [max, -max]), spring);
  const rotateY = useSpring(useTransform(px, [-0.5, 0.5], [-max, max]), spring);
  const z = useSpring(useMotionValue(0), spring);
  const glareFade = useSpring(glareOpacity, { stiffness: 160, damping: 26 });

  const glareBackground = useTransform(
    [gx, gy],
    ([x, y]) =>
      `radial-gradient(circle at ${x}% ${y}%, rgba(255,255,255,0.14), transparent 55%)`,
  );

  const handleMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (reducedMotion || event.pointerType !== "mouse") return;
    const node = ref.current;
    if (!node) return;

    const rect = node.getBoundingClientRect();
    const relX = (event.clientX - rect.left) / rect.width;
    const relY = (event.clientY - rect.top) / rect.height;

    px.set(relX - 0.5);
    py.set(relY - 0.5);
    gx.set(relX * 100);
    gy.set(relY * 100);
    z.set(lift);
    glareOpacity.set(1);
  };

  const reset = () => {
    px.set(0);
    py.set(0);
    gx.set(50);
    gy.set(50);
    z.set(0);
    glareOpacity.set(0);
  };

  if (reducedMotion) {
    return <div className={cn(className)}>{children}</div>;
  }

  return (
    <motion.div
      ref={ref}
      className={cn("relative", className)}
      style={{
        rotateX,
        rotateY,
        z,
        transformPerspective: 900,
        transformStyle: "preserve-3d",
      }}
      onPointerMove={handleMove}
      onPointerLeave={reset}
    >
      {children}
      {glare && (
        <motion.span
          className="pointer-events-none absolute inset-0 rounded-2xl"
          style={{ background: glareBackground, opacity: glareFade }}
          aria-hidden="true"
        />
      )}
    </motion.div>
  );
}
