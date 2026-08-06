"use client";

import { Environment, Lightformer } from "@react-three/drei";

/**
 * Procedural studio environment — the single most important change for making
 * the metal read as real.
 *
 * A `meshStandardMaterial` with `metalness: 1` and nothing to reflect renders
 * as flat dark grey, because a mirror shows only its surroundings. Physical
 * lights alone cannot fix this: they contribute a specular dot, not the broad
 * gradients that define chrome. What sells metal is the *shape* of the light
 * sources reflected in it.
 *
 * So instead of downloading an HDRI (1–2MB from a CDN, plus an external
 * dependency the CSP may block), we build the environment in code: emissive
 * planes arranged like a real product-photography setup. `Lightformer` meshes
 * inside `<Environment>` are rendered to an off-screen cube target and used as
 * the scene's environment map, so they appear in reflections without ever being
 * visible in the frame.
 *
 * The rig, mirroring a three-light studio:
 *   - a broad overhead softbox → the long vertical sweep down the bar
 *   - two side strips → the bright edges that define the cylinder's curvature
 *   - lime and cyan kickers → brand colour entering as *reflection*, which is
 *     what the old emissive materials were faking
 *   - a dark floor plane → grounds the lower half so it doesn't glow evenly
 */
export function StudioEnvironment({ isMobile }: { isMobile: boolean }) {
  return (
    <Environment
      // Half resolution on mobile: the cube target is re-rendered on mount and
      // 256 is indistinguishable at that reflection size.
      resolution={isMobile ? 128 : 256}
      frames={1}
      background={false}
    >
      {/* Base fill so unlit angles are charcoal rather than pure black.
          Tracks the lifted page base so reflections agree with the backdrop. */}
      <mesh scale={100}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial color="#161a21" side={1} />
      </mesh>

      {/* Overhead softbox — the primary highlight running along the bar. */}
      <Lightformer
        form="rect"
        intensity={5}
        color="#ffffff"
        position={[0, 5, -1]}
        rotation={[Math.PI / 2, 0, 0]}
        scale={[10, 6, 1]}
      />

      {/* Side strips: the two bright bands that describe a cylinder's curve. */}
      <Lightformer
        form="rect"
        intensity={3.2}
        color="#ffffff"
        position={[-5, 1, 1]}
        rotation={[0, Math.PI / 2, 0]}
        scale={[8, 3, 1]}
      />
      <Lightformer
        form="rect"
        intensity={2.4}
        color="#dfe6f2"
        position={[5, 0.5, 1]}
        rotation={[0, -Math.PI / 2, 0]}
        scale={[8, 3, 1]}
      />

      {/* Brand kickers. Colour arrives in the chrome as a reflection — the
          physically correct way to tint metal.

          Both are now in the orange family, matching the hero's heated-metal
          field: a warm amber bounce from below-left and a stronger ember
          kicker from upper-right, aligned with where the CSS flare sits so
          the 3D object looks lit by the same source as the backdrop. */}
      <Lightformer
        form="rect"
        intensity={2.4}
        color="#ffa45c"
        position={[-3.5, -2.5, 2.5]}
        rotation={[0, Math.PI / 3, 0]}
        scale={[5, 2, 1]}
      />
      <Lightformer
        form="rect"
        intensity={2.8}
        color="#ff6b35"
        position={[3.5, 2, -3]}
        rotation={[0, -Math.PI / 3, 0]}
        scale={[5, 2.5, 1]}
      />

      {/* Rim from behind — separates the silhouette from the background. */}
      <Lightformer
        form="ring"
        intensity={3}
        color="#ffffff"
        position={[0, 0.5, -6]}
        scale={[4, 4, 1]}
      />

      {/* Dark floor: without it the underside reflects the fill evenly and the
          object floats. Real products sit on something. */}
      <Lightformer
        form="rect"
        intensity={0.5}
        color="#05070a"
        position={[0, -4, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        scale={[12, 12, 1]}
      />
    </Environment>
  );
}
