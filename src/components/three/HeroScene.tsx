"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { ACESFilmicToneMapping } from "three";
import type { MotionValue } from "motion/react";
import { Dumbbell } from "./Dumbbell";
import { EnergyRings } from "./EnergyRings";
import { ParticleField } from "./ParticleField";
import { SceneRig } from "./SceneRig";
import { StudioEnvironment } from "./StudioEnvironment";

interface HeroSceneProps {
  isMobile: boolean;
  reducedMotion: boolean;
  scrollProgress?: MotionValue<number>;
  /** Called once the dumbbell lands, so the DOM labels can fade in on cue. */
  onSettled?: () => void;
}

const DESKTOP_PARTICLES = 700;
const MOBILE_PARTICLES = 280;

/** How long the impact shockwave stays expanded before relaxing. */
const BURST_HOLD_MS = 420;

function SceneContent({
  isMobile,
  reducedMotion,
  scrollProgress,
  onSettled,
}: HeroSceneProps) {
  const particleCount = isMobile ? MOBILE_PARTICLES : DESKTOP_PARTICLES;
  const [landed, setLanded] = useState(false);
  const [burst, setBurst] = useState(false);
  const burstTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSettled = useCallback(() => {
    setLanded(true);
    onSettled?.();
    if (reducedMotion) return;

    setBurst(true);
    burstTimer.current = setTimeout(() => setBurst(false), BURST_HOLD_MS);
  }, [reducedMotion, onSettled]);

  useEffect(
    () => () => {
      if (burstTimer.current) clearTimeout(burstTimer.current);
    },
    [],
  );

  return (
    <>
      {/*
        Lighting is now environment-driven. The reflected Lightformer rig in
        StudioEnvironment supplies the broad gradients that define metal; these
        few physical lights only add directional shaping and cast the shadow.

        The previous setup — strong lime and cyan point lights plus a spot —
        was compensating for the missing environment by washing the model in
        saturated colour, which flattened the form and read as neon plastic.
      */}
      <StudioEnvironment isMobile={isMobile} />
      <ambientLight intensity={0.18} />
      <directionalLight
        position={[4, 6, 4]}
        intensity={1.5}
        color="#ffffff"
        castShadow={!isMobile}
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0004}
      />
      <directionalLight position={[-5, -1, 2]} intensity={0.35} color="#9fb4d8" />

      {/* Every moving part lives inside the rig, so scroll recede and camera
          framing are applied once to the whole scene rather than per-object. */}
      <SceneRig reducedMotion={reducedMotion} scrollProgress={scrollProgress}>
        <Dumbbell reducedMotion={reducedMotion} onSettled={handleSettled} />
        <EnergyRings reducedMotion={reducedMotion} active={landed} />
        <ParticleField
          count={particleCount}
          reducedMotion={reducedMotion}
          burst={burst}
        />
      </SceneRig>
    </>
  );
}

export function HeroScene({
  isMobile,
  reducedMotion,
  scrollProgress,
  onSettled,
}: HeroSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.05 },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const dpr: [number, number] = isMobile ? [1, 1.5] : [1, 2];

  return (
    <div ref={containerRef} className="h-full w-full">
      <Canvas
        // Position is overridden every frame by SceneRig's responsive framing;
        // this is only the pre-first-frame value.
        // fov 35 is a mild telephoto. Wide-angle lenses exaggerate perspective
        // and make products look like toys; product photography shoots long,
        // which compresses depth and reads as expensive.
        camera={{ position: [0, 0, 7], fov: 35, near: 0.1, far: 100 }}
        dpr={dpr}
        frameloop={isVisible ? "always" : "never"}
        shadows={!isMobile}
        gl={{
          antialias: !isMobile,
          alpha: true,
          powerPreference: isMobile ? "low-power" : "high-performance",
        }}
        // ACES filmic is the film-industry standard curve. Without it, bright
        // chrome highlights clip to flat white and the metal loses its rolloff,
        // which is a large part of why renders look "CG" next to photographs.
        onCreated={({ gl }) => {
          gl.toneMapping = ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.15;
        }}
        style={{ background: "transparent" }}
      >
        <Suspense fallback={null}>
          <SceneContent
            isMobile={isMobile}
            reducedMotion={reducedMotion}
            scrollProgress={scrollProgress}
            onSettled={onSettled}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
