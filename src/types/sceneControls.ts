export interface CreateSceneControlsOptions {
  /** Initial OrbitControls.enabled; default true. */
  readonly enabled?: boolean;
}

/** OrbitControls wrapper used by the scene hook and SceneManager transform dragging. */
export interface SceneControlsHandle {
  setEnabled: (enabled: boolean) => void;
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
