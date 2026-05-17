export interface SceneControlsHandle {
  setEnabled: (enabled: boolean) => void;
  isEnabled: () => boolean;
  update: () => void;
  dispose: () => void;
}
