import { useCallback, useEffect, useRef, type RefObject } from "react";
import { Scene, WebGLRenderer, Color, REVISION } from "three";
import {
  createCamera,
  updateCameraProjection,
  resolveCameraSettings,
  type CameraProjection,
  type CameraSettings,
  type CameraSettingsInput,
} from "../helpers/camera";
import { createSceneControls } from "../helpers/sceneControls";
import type { SceneControlsHandle } from "../types/sceneControls";

const DEFAULT_BACKGROUND_COLOR = 0x101014;

export interface UseThreeSceneOptions extends CameraSettingsInput {
  cameraProjection?: CameraProjection;
  /** Initial enabled state; default true */
  controlsEnabled?: boolean;
  /** Hex (e.g. `0x101014`) or CSS color (e.g. `"#101014"`). Default `0x101014`. */
  backgroundColor?: number | string;
}

export interface UseThreeSceneResult {
  setControlsEnabled: (enabled: boolean) => void;
}

export function useThreeScene(
  containerRef: RefObject<HTMLDivElement>,
  options: UseThreeSceneOptions = {}
): UseThreeSceneResult {
  const {
    cameraProjection = "perspective",
    controlsEnabled: initialControlsEnabled = true,
    backgroundColor = DEFAULT_BACKGROUND_COLOR,
    ...cameraSettingsInput
  } = options;

  const initRef = useRef<{
    projection: CameraProjection;
    controlsEnabled: boolean;
    cameraSettings: CameraSettings;
    backgroundColor: number | string;
  } | null>(null);

  if (initRef.current === null) {
    initRef.current = {
      projection: cameraProjection,
      controlsEnabled: initialControlsEnabled,
      cameraSettings: resolveCameraSettings(cameraSettingsInput),
      backgroundColor,
    };
  }

  const controlsHandleRef = useRef<SceneControlsHandle | null>(null);

  const setControlsEnabled = useCallback((enabled: boolean): void => {
    controlsHandleRef.current?.setEnabled(enabled);
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const { projection, controlsEnabled, cameraSettings, backgroundColor } =
      initRef.current!;

    const scene = new Scene();
    scene.background = new Color(backgroundColor);

    const renderer = new WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    const camera = createCamera(container, projection, cameraSettings);
    const controls = createSceneControls(camera, renderer.domElement, {
      enabled: controlsEnabled,
    });
    controlsHandleRef.current = controls;

    console.log("[boot] three.js works", { revision: REVISION });

    let frameId = 0;

    const render = (): void => {
      controls.update();
      renderer.render(scene, camera);
      frameId = requestAnimationFrame(render);
    };

    const handleResize = (): void => {
      updateCameraProjection(camera, container, cameraSettings);
      const h = Math.max(container.clientHeight, 1);
      renderer.setSize(container.clientWidth, h);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);
    handleResize();
    render();

    return () => {
      cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      controls.dispose();
      controlsHandleRef.current = null;
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [containerRef]);

  return { setControlsEnabled };
}
