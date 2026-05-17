import type { Camera } from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import type { SceneControlsHandle } from "../types/sceneControls";

export interface CreateSceneControlsOptions {
  enabled?: boolean;
}

export function createSceneControls(
  camera: Camera,
  domElement: HTMLElement,
  options: CreateSceneControlsOptions = {},
): SceneControlsHandle {
  const { enabled = true } = options;
  const controls = new OrbitControls(camera, domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.screenSpacePanning = true;
  controls.enabled = enabled;

  return {
    setEnabled: (value: boolean) => {
      controls.enabled = value;
    },
    isEnabled: () => controls.enabled,
    suspend: () => {
      const previous = controls.enabled;
      controls.enabled = false;
      return () => {
        controls.enabled = previous;
      };
    },
    update: () => controls.update(),
    dispose: () => controls.dispose(),
  };
}
