import { FLAT_SHAPE_PLANE_Y } from "./flatShapeTransform";
import type { Vector3State } from "../types/sceneObjects";

/** Locked world-Y for translate in 2D view (objects stay on the XZ grid plane). */
export interface PositionYLock {
  readonly y: number;
}

/** Locked local-Y scale in 2D view (only X/Z may change). */
export interface ScaleYLock {
  readonly y: number;
}

export function capturePositionYLock(y: number): PositionYLock {
  return { y };
}

export function captureScaleYLock(y: number): ScaleYLock {
  return { y };
}

export function positionOnXZPlane(
  position: Vector3State,
  lock: PositionYLock,
): Vector3State {
  return { x: position.x, y: lock.y, z: position.z };
}

export function scaleOnXZPlane(scale: Vector3State, lock: ScaleYLock): Vector3State {
  return { x: scale.x, y: lock.y, z: scale.z };
}

/** Flat shapes on the grid use a fixed plane Y. */
export const FLAT_SHAPE_POSITION_Y_LOCK: PositionYLock = {
  y: FLAT_SHAPE_PLANE_Y,
};
