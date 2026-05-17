import { useEffect, useRef, type RefObject } from "react";
import { OrthographicCamera, PerspectiveCamera } from "three";

export type CameraProjection = "perspective" | "orthographic";

export interface CameraSettings {
  fov: number;
  near: number;
  far: number;
  positionZ: number;
  orthoViewHeight: number;
}

export interface CameraSettingsInput {
  fov?: number;
  near?: number;
  far?: number;
  positionZ?: number;
  orthoViewHeight?: number;
}

export const DEFAULT_CAMERA_SETTINGS: CameraSettings = {
  fov: 60,
  near: 0.1,
  far: 100,
  positionZ: 5,
  orthoViewHeight: 5,
};

export interface UseCameraOptions extends CameraSettingsInput {
  projection?: CameraProjection;
}

export function resolveCameraSettings(
  input: CameraSettingsInput = {}
): CameraSettings {
  return {
    fov: input.fov ?? DEFAULT_CAMERA_SETTINGS.fov,
    near: input.near ?? DEFAULT_CAMERA_SETTINGS.near,
    far: input.far ?? DEFAULT_CAMERA_SETTINGS.far,
    positionZ: input.positionZ ?? DEFAULT_CAMERA_SETTINGS.positionZ,
    orthoViewHeight:
      input.orthoViewHeight ?? DEFAULT_CAMERA_SETTINGS.orthoViewHeight,
  };
}

export function getContainerAspect(container: HTMLDivElement): number {
  return container.clientWidth / Math.max(container.clientHeight, 1);
}

function setOrthographicFrustum(
  camera: OrthographicCamera,
  aspect: number,
  viewHeight: number
): void {
  const halfH = viewHeight / 2;
  const halfW = halfH * aspect;
  camera.left = -halfW;
  camera.right = halfW;
  camera.top = halfH;
  camera.bottom = -halfH;
}

export function createPerspectiveCamera(
  container: HTMLDivElement,
  settings: CameraSettings = DEFAULT_CAMERA_SETTINGS
): PerspectiveCamera {
  const camera = new PerspectiveCamera(
    settings.fov,
    getContainerAspect(container),
    settings.near,
    settings.far
  );
  camera.position.z = settings.positionZ;
  return camera;
}

export function createOrthographicCamera(
  container: HTMLDivElement,
  settings: CameraSettings = DEFAULT_CAMERA_SETTINGS
): OrthographicCamera {
  const camera = new OrthographicCamera(
    0,
    0,
    0,
    0,
    settings.near,
    settings.far
  );
  setOrthographicFrustum(
    camera,
    getContainerAspect(container),
    settings.orthoViewHeight
  );
  camera.position.z = settings.positionZ;
  return camera;
}

export function createCamera(
  container: HTMLDivElement,
  projection: CameraProjection = "perspective",
  settings: CameraSettings = DEFAULT_CAMERA_SETTINGS
): PerspectiveCamera | OrthographicCamera {
  return projection === "orthographic"
    ? createOrthographicCamera(container, settings)
    : createPerspectiveCamera(container, settings);
}

export function updateCameraProjection(
  camera: PerspectiveCamera | OrthographicCamera,
  container: HTMLDivElement,
  settings: CameraSettings = DEFAULT_CAMERA_SETTINGS
): void {
  const aspect = getContainerAspect(container);

  if (camera instanceof OrthographicCamera) {
    setOrthographicFrustum(camera, aspect, settings.orthoViewHeight);
  } else if (camera instanceof PerspectiveCamera) {
    camera.aspect = aspect;
  }

  camera.updateProjectionMatrix();
}

export function applyCameraSettings(
  camera: PerspectiveCamera | OrthographicCamera,
  container: HTMLDivElement,
  settings: CameraSettings
): void {
  camera.near = settings.near;
  camera.far = settings.far;
  camera.position.z = settings.positionZ;

  if (camera instanceof PerspectiveCamera) {
    camera.fov = settings.fov;
    camera.aspect = getContainerAspect(container);
    camera.updateProjectionMatrix();
    return;
  }

  setOrthographicFrustum(
    camera,
    getContainerAspect(container),
    settings.orthoViewHeight
  );
  camera.updateProjectionMatrix();
}

function isSameProjection(
  camera: PerspectiveCamera | OrthographicCamera,
  projection: CameraProjection
): boolean {
  return (
    (projection === "perspective" && camera instanceof PerspectiveCamera) ||
    (projection === "orthographic" && camera instanceof OrthographicCamera)
  );
}

export function useCamera(
  containerRef: RefObject<HTMLDivElement>,
  options: UseCameraOptions = {}
): RefObject<PerspectiveCamera | OrthographicCamera | null> {
  const { projection = "perspective", ...settingsInput } = options;
  const settings = resolveCameraSettings(settingsInput);
  const cameraRef = useRef<PerspectiveCamera | OrthographicCamera | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const current = cameraRef.current;
    if (current && isSameProjection(current, projection)) {
      applyCameraSettings(current, container, settings);
      return;
    }

    const camera = createCamera(container, projection, settings);
    cameraRef.current = camera;

    return () => {
      cameraRef.current = null;
    };
  }, [
    containerRef,
    projection,
    settings.fov,
    settings.near,
    settings.far,
    settings.positionZ,
    settings.orthoViewHeight,
  ]);

  return cameraRef;
}
