import { FLAT_SHAPE_ROTATION_X } from "../constants/sceneDraw";
import type { EulerState } from "../types/sceneObjects";

export interface RotationAxisLock {
  readonly x: number;
  readonly z: number;
}

/** X/Z euler lock for shapes lying on the scene grid (XZ plane). */
export const FLAT_ON_XZ_ROTATION_LOCK: RotationAxisLock = {
  x: FLAT_SHAPE_ROTATION_X,
  z: 0,
};

export function captureRotationAxisLock(rotation: EulerState): RotationAxisLock {
  return { x: rotation.x, z: rotation.z };
}

/** Keeps X/Z euler angles fixed; only Y may change (2D view on XZ plane). */
export function rotationWithYAxisOnly(
  rotation: EulerState,
  lock: RotationAxisLock,
): EulerState {
  return { x: lock.x, y: rotation.y, z: lock.z };
}
