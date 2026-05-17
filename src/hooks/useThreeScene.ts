import { useEffect, useRef, type RefObject } from "react";
import { Scene, WebGLRenderer, Color, REVISION } from "three";
import {
  useCamera,
  updateCameraProjection,
  resolveCameraSettings,
  type CameraSettings,
  type CameraSettingsInput,
  type CameraProjection,
} from "./useCamera";

export interface UseThreeSceneOptions extends CameraSettingsInput {
  cameraProjection?: CameraProjection;
}

export function useThreeScene(
  containerRef: RefObject<HTMLDivElement>,
  options: UseThreeSceneOptions = {}
): void {
  const { cameraProjection, ...cameraSettingsInput } = options;
  const cameraSettings = resolveCameraSettings(cameraSettingsInput);
  const cameraSettingsRef = useRef<CameraSettings>(cameraSettings);
  cameraSettingsRef.current = cameraSettings;

  const cameraRef = useCamera(containerRef, {
    projection: cameraProjection,
    ...cameraSettingsInput,
  });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new Scene();
    scene.background = new Color(0x101014);

    const renderer = new WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    console.log("[boot] three.js works", { revision: REVISION });

    let frameId = 0;

    const render = (): void => {
      const camera = cameraRef.current;
      if (camera) {
        renderer.render(scene, camera);
      }
      frameId = requestAnimationFrame(render);
    };

    render();

    const handleResize = (): void => {
      const camera = cameraRef.current;
      if (!camera) return;

      updateCameraProjection(camera, container, cameraSettingsRef.current);
      const h = Math.max(container.clientHeight, 1);
      renderer.setSize(container.clientWidth, h);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [containerRef, cameraRef]);
}
