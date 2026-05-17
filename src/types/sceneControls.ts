export interface SceneControlsHandle {
  setEnabled: (enabled: boolean) => void;
  isEnabled: () => boolean;
  /** Disables orbit; call returned fn to restore prior enabled state. */
  suspend: () => () => void;
  update: () => void;
  dispose: () => void;
}
