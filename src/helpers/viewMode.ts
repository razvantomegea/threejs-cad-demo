import type { Camera, PerspectiveCamera } from "three";
import type { CameraSettings } from "./camera";

/** Top-down orthographic view onto the XZ plane (camera on +Y). */
export function orientCameraTopDownXZ(camera: Camera, height: number): void {
  camera.position.set(0, height, 0);
  camera.up.set(0, 0, -1);
  camera.lookAt(0, 0, 0);
}

/** Default perspective orbit view (camera on +Z). */
export function orientCameraPerspective3D(
  camera: PerspectiveCamera,
  settings: CameraSettings,
): void {
  camera.up.set(0, 1, 0);
  camera.position.set(0, 0, settings.positionZ);
  camera.lookAt(0, 0, 0);
}
