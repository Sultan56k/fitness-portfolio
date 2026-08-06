"use client";

import { useRef, type ReactNode } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import type { MotionValue } from "motion/react";
import { Group, MathUtils } from "three";
import { useResponsiveFraming } from "./useResponsiveFraming";

interface SceneRigProps {
  reducedMotion: boolean;
  /** Hero scroll progress (0→1). */
  scrollProgress?: MotionValue<number>;
  children: ReactNode;
}

/**
 * Single owner of camera framing and scroll response for the whole hero scene.
 *
 * Previously the camera sat at a fixed z=5 (clipping the rings on narrow
 * viewports), the scroll recede was applied inside `Dumbbell` while
 * `EnergyRings` applied a second conflicting scale, and a CSS `scale`/`y`
 * transform on the wrapping element moved the canvas element itself — which
 * resamples the WebGL backing store and looks blurry. All of that now happens
 * here, once, in world space:
 *
 *   - camera distance is derived from the viewport (see useResponsiveFraming)
 *   - scroll pushes this whole group back and fades it, so every child recedes
 *     together with correct relative parallax
 *   - pointer parallax is an *offset* around the rig target rather than an
 *     absolute camera position, so it composes with the recede instead of
 *     overwriting it
 */
export function SceneRig({
  reducedMotion,
  scrollProgress,
  children,
}: SceneRigProps) {
  const groupRef = useRef<Group>(null);
  const { camera } = useThree();
  const { distance, offsetX } = useResponsiveFraming();

  /** Smoothed pointer position in normalised device coords. */
  const parallax = useRef({ x: 0, y: 0 });
  /** Smoothed scroll progress — damping here keeps fast wheel input from jolting. */
  const progress = useRef(0);

  useFrame((state, rawDelta) => {
    const group = groupRef.current;
    if (!group) return;

    // Clamp delta so a backgrounded tab can't teleport the animation, and
    // convert the smoothing factors to be frame-rate independent so the motion
    // feels identical at 60Hz and 144Hz.
    const delta = Math.min(rawDelta, 0.05);

    const target = scrollProgress?.get() ?? 0;
    progress.current = MathUtils.damp(progress.current, target, 6, delta);
    const p = progress.current;

    // Pointer parallax, read from R3F's own normalised pointer so it respects
    // the canvas bounds — the old window-based version drifted on any page
    // where the canvas wasn't full-window.
    if (!reducedMotion) {
      parallax.current.x = MathUtils.damp(
        parallax.current.x,
        state.pointer.x,
        3,
        delta,
      );
      parallax.current.y = MathUtils.damp(
        parallax.current.y,
        state.pointer.y,
        3,
        delta,
      );
    }

    // Camera: framed distance, plus a small parallax offset. Because the offset
    // is applied to a known base rather than accumulated, it can never drift.
    camera.position.set(
      parallax.current.x * 0.45,
      parallax.current.y * 0.3,
      distance,
    );
    camera.lookAt(0, 0, 0);

    // Scroll: the entire scene recedes and drifts up as the hero exits. One
    // transform on one group — children just animate locally.
    group.position.set(offsetX, -p * 0.9, -p * 3.2);
    group.rotation.x = p * 0.28;
    group.scale.setScalar(1 - p * 0.12);
  });

  return <group ref={groupRef}>{children}</group>;
}
