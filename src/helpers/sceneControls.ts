import type { Camera } from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import type {
  CreateSceneControlsOptions,
  SceneControlsHandle,
} from "../types/sceneControls";

export function createSceneControls(
  camera: Camera,
  domElement: HTMLElement,
  options: CreateSceneControlsOptions = {},
): SceneControlsHandle {
  const { enabled = true } = options;
  const controls = new OrbitControls(camera, domElement);
  controls.enabled = enabled;

  return {
    setEnabled: (value: boolean) => {
      controls.enabled = value;
    },
    setCamera: (camera: Camera) => {
      controls.object = camera;
      controls.update();
    },
    setRotateEnabled: (enabled: boolean) => {
      controls.enableRotate = enabled;
    },
    resetTarget: () => {
      controls.target.set(0, 0, 0);
      controls.update();
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
