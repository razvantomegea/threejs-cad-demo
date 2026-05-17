import { useEffect, useRef, type RefObject } from "react";
import { PerspectiveCamera } from "three";

const CAMERA_FOV = 60;
const CAMERA_NEAR = 0.1;
const CAMERA_FAR = 100;
const CAMERA_DEFAULT_Z = 5;

export function getContainerAspect(container: HTMLDivElement): number {
  return container.clientWidth / Math.max(container.clientHeight, 1);
}

export function createPerspectiveCamera(
  container: HTMLDivElement
): PerspectiveCamera {
  const camera = new PerspectiveCamera(
    CAMERA_FOV,
    getContainerAspect(container),
    CAMERA_NEAR,
    CAMERA_FAR
  );
  camera.position.z = CAMERA_DEFAULT_Z;
  return camera;
}

export function updateCameraProjection(
  camera: PerspectiveCamera,
  container: HTMLDivElement
): void {
  camera.aspect = getContainerAspect(container);
  camera.updateProjectionMatrix();
}

export function useCamera(
  containerRef: RefObject<HTMLDivElement>
): RefObject<PerspectiveCamera | null> {
  const cameraRef = useRef<PerspectiveCamera | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const camera = createPerspectiveCamera(container);
    cameraRef.current = camera;

    return () => {
      cameraRef.current = null;
    };
  }, [containerRef]);

  return cameraRef;
}
