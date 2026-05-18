import type { Camera } from "three";

export interface CreateSceneControlsOptions {
  /** Initial OrbitControls.enabled; default true. */
  readonly enabled?: boolean;
}

/** OrbitControls wrapper used by the scene hook and SceneManager transform dragging. */
export interface SceneControlsHandle {
  setEnabled: (enabled: boolean) => void;
  /** Attach orbit controls to a different camera (e.g. when switching 2D / 3D). */
  setCamera: (camera: Camera) => void;
  /** When false, orbit rotation is disabled (pan / zoom only). */
  setRotateEnabled: (enabled: boolean) => void;
  resetTarget: () => void;
  /** Current OrbitControls.enabled value. */
  isEnabled: () => boolean;
  /**
   * Disables orbit for transform dragging. Call the returned function once to
   * restore the enabled state that was active before suspend.
   */
  suspend: () => () => void;
  update: () => void;
  dispose: () => void;
}
