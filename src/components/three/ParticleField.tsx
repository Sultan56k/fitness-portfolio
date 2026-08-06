"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { BufferAttribute, Points } from "three";
import { AdditiveBlending } from "three";

interface ParticleFieldProps {
  count?: number;
  reducedMotion?: boolean;
  /** When the dumbbell lands, particles blow outward then settle back. */
  burst?: boolean;
}

export function ParticleField({
  count = 600,
  reducedMotion = false,
  burst = false,
}: ParticleFieldProps) {
  const pointsRef = useRef<Points>(null);
  /** Advances 0→1 once on landing; the pulse shape is derived from it. */
  const burstProgress = useRef(0);
  const burstStarted = useRef(false);
  const time = useRef(0);

  const { positions, colors, restRadii, directions } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const radii = new Float32Array(count);
    const dirs = new Float32Array(count * 3);
    const lime = { r: 0.22, g: 1, b: 0.08 };
    const cyan = { r: 0, g: 0.83, b: 1 };

    for (let i = 0; i < count; i++) {
      const radius = 1.8 + Math.random() * 2.5;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      const x = Math.sin(phi) * Math.cos(theta);
      const y = Math.sin(phi) * Math.sin(theta);
      const z = Math.cos(phi);

      radii[i] = radius;
      dirs[i * 3] = x;
      dirs[i * 3 + 1] = y;
      dirs[i * 3 + 2] = z;

      pos[i * 3] = x * radius;
      pos[i * 3 + 1] = y * radius;
      pos[i * 3 + 2] = z * radius;

      const mix = Math.random();
      col[i * 3] = lime.r * mix + cyan.r * (1 - mix);
      col[i * 3 + 1] = lime.g * mix + cyan.g * (1 - mix);
      col[i * 3 + 2] = lime.b * mix + cyan.b * (1 - mix);
    }

    return { positions: pos, colors: col, restRadii: radii, directions: dirs };
  }, [count]);

  useFrame((_, rawDelta) => {
    const points = pointsRef.current;
    if (reducedMotion || !points) return;

    const delta = Math.min(rawDelta, 0.05);
    time.current += delta;

    points.rotation.y += delta * 0.04;
    points.rotation.x += delta * 0.015;

    // Impact shockwave: a single 0→1 sweep on landing. sin(progress * π) rises
    // to a peak mid-sweep and returns to zero, so particles push out and settle
    // exactly once — no snap-back, no residual offset.
    if (burst) burstStarted.current = true;

    // Idle before the trigger, or done sweeping: positions already sit at rest.
    if (!burstStarted.current || burstProgress.current >= 1) return;

    burstProgress.current = Math.min(burstProgress.current + delta * 0.85, 1);

    const attribute = points.geometry.getAttribute(
      "position",
    ) as BufferAttribute;
    const array = attribute.array as Float32Array;
    const push = Math.sin(burstProgress.current * Math.PI) * 0.9;

    for (let i = 0; i < count; i++) {
      const radius = restRadii[i] + push;
      array[i * 3] = directions[i * 3] * radius;
      array[i * 3 + 1] = directions[i * 3 + 1] * radius;
      array[i * 3 + 2] = directions[i * 3 + 2] * radius;
    }

    attribute.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.028}
        vertexColors
        transparent
        opacity={0.8}
        sizeAttenuation
        depthWrite={false}
        blending={AdditiveBlending}
      />
    </points>
  );
}
