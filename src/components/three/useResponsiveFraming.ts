"use client";

import { useThree } from "@react-three/fiber";
import { useMemo } from "react";

/**
 * The framing radius, in world units.
 *
 * This is deliberately sized to the *dumbbell* (half-length ≈ 1.35), not to the
 * outermost energy ring. Previously it was 3.1 — large enough to guarantee the
 * rings never clipped — which forced the camera far enough back that the
 * product sat small and central, framed around decoration the viewer barely
 * registers.
 *
 * Product-hero framing does the opposite: the subject is oversized and allowed
 * to run past the edges of the frame, which is what makes it feel physically
 * present rather than diagrammed. The rings are ambient; letting them crop is
 * the correct trade.
 */
export const SCENE_RADIUS = 1.5;

/**
 * Distance the camera must sit at for a sphere of `radius` to fit inside the
 * frustum, accounting for BOTH axes. On a portrait/narrow viewport the
 * horizontal FOV is the binding constraint, not the vertical one — this is the
 * bug that made the rings clip off the sides at the old fixed z=5.
 */
export function fitDistance(radius: number, fovDeg: number, aspect: number) {
  const vFov = (fovDeg * Math.PI) / 180;
  const hFov = 2 * Math.atan(Math.tan(vFov / 2) * aspect);
  // The tighter of the two axes decides how far back we have to be.
  return radius / Math.sin(Math.min(vFov, hFov) / 2);
}

interface Framing {
  /** Camera z distance that keeps the whole scene in frame. */
  distance: number;
  /** Half-width of the visible area at z = 0, in world units. */
  halfWidth: number;
  /** Half-height of the visible area at z = 0, in world units. */
  halfHeight: number;
  /**
   * How far right of centre the object should sit so it clears the headline
   * column on wide screens. Zero on narrow screens, where the text sits over
   * a scrim instead and the object should stay centred.
   */
  offsetX: number;
}

/**
 * Derives camera distance and object placement from the live viewport, so the
 * hero is framed identically at 375px and at 2560px. Recomputes only when the
 * canvas size actually changes — `useThree` gives us that for free.
 */
/**
 * `padding` below 1 intentionally frames *tighter* than the bounding radius, so
 * the plates run past the frame edge. That crop is the effect — a product hero
 * reads as close and physical precisely because it doesn't all fit.
 */
export function useResponsiveFraming(padding = 0.82): Framing {
  const { size, camera } = useThree();

  return useMemo(() => {
    const aspect = size.width / size.height || 1;
    const fov = "fov" in camera ? (camera.fov as number) : 35;

    // Narrow viewports get slightly more room: with the copy stacked over the
    // scene, an aggressive crop leaves nothing legible behind the text.
    const effectivePadding = aspect < 1.15 ? padding * 1.35 : padding;
    const distance = fitDistance(SCENE_RADIUS * effectivePadding, fov, aspect);

    const vFov = (fov * Math.PI) / 180;
    const halfHeight = Math.tan(vFov / 2) * distance;
    const halfWidth = halfHeight * aspect;

    // Push the product well into the right half on wide screens, clear of the
    // headline column. Larger than the old 0.3 factor because the object is now
    // much bigger in frame and would otherwise collide with the copy.
    const offsetX = aspect > 1.15 ? Math.min(halfWidth * 0.42, 2.4) : 0;

    return { distance, halfWidth, halfHeight, offsetX };
  }, [size.width, size.height, camera, padding]);
}
