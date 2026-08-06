"use client";

import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import type { PerspectiveCamera } from "three";

interface CameraRigProps {
  reducedMotion: boolean;
}

export function CameraRig({ reducedMotion }: CameraRigProps) {
  const { camera } = useThree();
  const mouse = useRef({ x: 0, y: 0 });
  const target = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (reducedMotion) return;

    const onMove = (event: PointerEvent) => {
      target.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      target.current.y = -(event.clientY / window.innerHeight) * 2 + 1;
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [reducedMotion]);

  useFrame(() => {
    if (reducedMotion) return;

    const cam = camera as PerspectiveCamera;
    mouse.current.x += (target.current.x * 0.35 - mouse.current.x) * 0.06;
    mouse.current.y += (target.current.y * 0.25 - mouse.current.y) * 0.06;

    cam.position.x = mouse.current.x;
    cam.position.y = mouse.current.y;
    cam.lookAt(0, 0, 0);
  });

  return null;
}
