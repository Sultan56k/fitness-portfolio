"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Group, MathUtils } from "three";

interface DumbbellProps {
  reducedMotion?: boolean;
  /** Fires once the entrance has settled, so labels can appear on cue. */
  onSettled?: () => void;
}

/**
 * Physically-plausible palette. Nothing here emits light.
 *
 * Emissive materials were the single biggest reason the old dumbbell read as
 * cartoonish: real gym equipment does not glow, and self-illuminated geometry
 * is the visual signature of a 3D render rather than a photograph. All colour
 * now comes from lighting and environment reflections, exactly as it would in
 * a product shoot.
 */
const CHROME = "#e8ecf2";
const STEEL_DARK = "#8f97a6";
const RUBBER = "#15171d";
const RUBBER_EDGE = "#22252e";

/** Seconds the entrance takes before the idle settle takes over. */
const FLIGHT_DURATION = 1.6;

/**
 * Resting pose — a three-quarter view. Straight-on reads as a technical
 * diagram; this angle shows the bar, the plate faces and their depth at once,
 * which is how product photography frames a symmetrical object.
 */
const REST_ROTATION = { x: 0.16, y: -0.62, z: 0.07 };

/** Entrance offset, in local units, added to the rest pose. */
const ENTRY_OFFSET = { y: 0.9, rotY: -1.1 };

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

/**
 * One rubber-coated hex-ish plate stack. Real loadable dumbbells step down in
 * radius outward and are dominated by one large plate, not three equal discs —
 * the old 0.72/0.6/0.46 triple stack is what gave it a toy silhouette.
 */
function PlateStack({ side }: { side: 1 | -1 }) {
  const plates = useMemo(
    () => [
      // Main mass: wide rubber-coated plate.
      { offset: 0.66, radius: 0.78, width: 0.26, color: RUBBER, rough: 0.72, metal: 0.05 },
      // Secondary, slightly proud of the main plate.
      { offset: 0.9, radius: 0.66, width: 0.2, color: RUBBER_EDGE, rough: 0.66, metal: 0.08 },
    ],
    [],
  );

  return (
    <group>
      {plates.map((plate) => (
        <group
          key={plate.offset}
          position={[side * plate.offset, 0, 0]}
          rotation={[0, 0, Math.PI / 2]}
        >
          <mesh castShadow receiveShadow>
            <cylinderGeometry
              args={[plate.radius, plate.radius, plate.width, 64]}
            />
            <meshStandardMaterial
              color={plate.color}
              metalness={plate.metal}
              roughness={plate.rough}
            />
          </mesh>

          {/* Chrome trim ring at the plate edge. A real highlight from a real
              reflection, not an emissive fake. */}
          <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
            <torusGeometry args={[plate.radius - 0.008, 0.026, 16, 96]} />
            <meshStandardMaterial
              color={CHROME}
              metalness={1}
              roughness={0.12}
            />
          </mesh>
        </group>
      ))}

      {/* Chrome collar between the plates and the grip. */}
      <mesh
        position={[side * 0.46, 0, 0]}
        rotation={[0, 0, Math.PI / 2]}
        castShadow
      >
        <cylinderGeometry args={[0.24, 0.28, 0.14, 48]} />
        <meshStandardMaterial color={CHROME} metalness={1} roughness={0.16} />
      </mesh>

      {/* Outer end cap, slightly domed. */}
      <mesh
        position={[side * 1.02, 0, 0]}
        rotation={[0, 0, Math.PI / 2]}
        castShadow
      >
        <cylinderGeometry args={[0.3, 0.34, 0.09, 48]} />
        <meshStandardMaterial
          color={STEEL_DARK}
          metalness={1}
          roughness={0.24}
        />
      </mesh>
    </group>
  );
}

/**
 * Knurled grip. Modelled as a dense ring of fine ridges around the bar — at
 * hero scale the cross-hatch actually reads, and catching light along each
 * ridge is what makes the grip look machined rather than smooth-shaded.
 */
function Knurling() {
  const ridges = useMemo(() => {
    const items: { angle: number }[] = [];
    const count = 56;
    for (let i = 0; i < count; i++) {
      items.push({ angle: (i / count) * Math.PI * 2 });
    }
    return items;
  }, []);

  return (
    <group>
      {ridges.map(({ angle }) => (
        <mesh
          key={angle}
          position={[0, Math.sin(angle) * 0.129, Math.cos(angle) * 0.129]}
          rotation={[angle, 0, Math.PI / 2]}
          castShadow
        >
          <boxGeometry args={[0.009, 0.66, 0.016]} />
          <meshStandardMaterial
            color={STEEL_DARK}
            metalness={1}
            roughness={0.42}
          />
        </mesh>
      ))}
    </group>
  );
}

export function Dumbbell({ reducedMotion = false, onSettled }: DumbbellProps) {
  const outerRef = useRef<Group>(null);
  const flightTime = useRef(0);
  const idleTime = useRef(0);
  const settled = useRef(false);

  useFrame((_, rawDelta) => {
    const outer = outerRef.current;
    if (!outer) return;

    // Clamp delta so a backgrounded tab doesn't teleport the animation.
    const delta = Math.min(rawDelta, 0.05);

    if (reducedMotion) {
      outer.position.set(0, 0, 0);
      outer.rotation.set(REST_ROTATION.x, REST_ROTATION.y, REST_ROTATION.z);
      outer.scale.setScalar(1);
      if (!settled.current) {
        settled.current = true;
        onSettled?.();
      }
      return;
    }

    // ---- Phase 1: entrance ----
    // A restrained settle into the hero pose: rise, a short rotation, and a
    // slight scale-up. The old version tumbled through two full spins, which
    // is why it read as a toy being thrown rather than a product being placed.
    if (flightTime.current < FLIGHT_DURATION) {
      flightTime.current += delta;
      const t = Math.min(flightTime.current / FLIGHT_DURATION, 1);
      const e = easeOutCubic(t);

      outer.position.set(0, MathUtils.lerp(ENTRY_OFFSET.y, 0, e), 0);
      outer.rotation.set(
        REST_ROTATION.x,
        MathUtils.lerp(REST_ROTATION.y + ENTRY_OFFSET.rotY, REST_ROTATION.y, e),
        REST_ROTATION.z,
      );
      outer.scale.setScalar(MathUtils.lerp(0.86, 1, e));

      if (t >= 1 && !settled.current) {
        settled.current = true;
        onSettled?.();
      }
      return;
    }

    // ---- Phase 2: hero pose, alive but not spinning ----
    // The object holds its pose. Only a slow breathing drift and a few degrees
    // of sway remain — enough that the scene isn't frozen, far short of the
    // perpetual rotation that made it look like a screensaver.
    idleTime.current += delta;
    const idle = idleTime.current;

    outer.position.set(0, Math.sin(idle * 0.55) * 0.045, 0);
    outer.rotation.set(
      REST_ROTATION.x + Math.sin(idle * 0.42) * 0.022,
      REST_ROTATION.y + Math.sin(idle * 0.31) * 0.045,
      REST_ROTATION.z + Math.cos(idle * 0.37) * 0.014,
    );
    outer.scale.setScalar(1);
  });

  return (
    <group ref={outerRef} position={[0, ENTRY_OFFSET.y, 0]} scale={0.86}>
      {/* Bar. Longer and thinner than before so the silhouette reads as a
          real loadable dumbbell rather than a stubby toy. */}
      <mesh rotation={[0, 0, Math.PI / 2]} castShadow receiveShadow>
        <cylinderGeometry args={[0.125, 0.125, 2.05, 48]} />
        <meshStandardMaterial color={CHROME} metalness={1} roughness={0.14} />
      </mesh>

      <Knurling />
      <PlateStack side={1} />
      <PlateStack side={-1} />
    </group>
  );
}
