"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group, Mesh } from "three";
import { AdditiveBlending, MathUtils } from "three";

interface EnergyRingsProps {
  reducedMotion?: boolean;
  /** Rings expand outward once the dumbbell has landed — an impact shockwave. */
  active: boolean;
}

/**
 * Ambient orbit rings. Pulled in tight and made much finer now that the camera
 * crops close: at the old 1.85–2.7 radii they sat almost entirely outside the
 * frame, and their additive neon competed with the photoreal metal rather than
 * supporting it. They now read as faint light traces at the edges — depth cues,
 * not decoration.
 */
const RINGS = [
  { radius: 1.5, tube: 0.005, color: "#ff8a4a", speed: 0.18, tilt: 1.2 },
  { radius: 1.78, tube: 0.004, color: "#ffd9a0", speed: -0.13, tilt: -0.9 },
  { radius: 2.05, tube: 0.003, color: "#ff6b35", speed: 0.09, tilt: 0.4 },
];

export function EnergyRings({
  reducedMotion = false,
  active,
}: EnergyRingsProps) {
  const groupRef = useRef<Group>(null);
  const ringRefs = useRef<(Mesh | null)[]>([]);
  const time = useRef(0);
  const reveal = useRef(0);

  useFrame((_, rawDelta) => {
    const group = groupRef.current;
    if (!group) return;

    const delta = Math.min(rawDelta, 0.05);

    // Rings scale in from the centre when the dumbbell lands, then hold.
    const target = active ? 1 : 0;
    reveal.current = reducedMotion
      ? target
      : MathUtils.lerp(reveal.current, target, delta * 3.2);

    // Only the reveal is applied here — the scroll recede is a single
    // transform on SceneRig's group, which this sits inside.
    group.scale.setScalar(reveal.current);

    if (reducedMotion) return;

    time.current += delta;

    ringRefs.current.forEach((ring, index) => {
      if (!ring) return;
      const config = RINGS[index];
      ring.rotation.z = time.current * config.speed;
      ring.rotation.x = config.tilt + Math.sin(time.current * 0.3) * 0.15;

      const material = ring.material as { opacity: number };
      // Each ring breathes on its own offset so they never pulse in lockstep.
      // Kept faint on purpose — bright additive lines next to photoreal chrome
      // pull the eye away from the product and undo the realism.
      material.opacity =
        reveal.current *
        (0.14 + Math.sin(time.current * 0.9 + index * 1.4) * 0.07);
    });
  });

  return (
    <group ref={groupRef} scale={0}>
      {RINGS.map((config, index) => (
        <mesh
          key={config.radius}
          ref={(node) => {
            ringRefs.current[index] = node;
          }}
          rotation={[config.tilt, 0, 0]}
        >
          <torusGeometry args={[config.radius, config.tube, 8, 96]} />
          <meshBasicMaterial
            color={config.color}
            transparent
            opacity={0.3}
            blending={AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  );
}
