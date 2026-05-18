import {
  type Object3D,
  Quaternion,
  Vector3,
} from "three";
import { FLAT_SHAPE_ROTATION_X } from "../constants/sceneDraw";
import {
  SceneObjectKind,
  type EulerState,
  type SceneObjectConfig,
  type SceneObjectTransform,
  type Vector3State,
} from "../types/sceneObjects";

const _axisX = new Vector3(1, 0, 0);
const _axisY = new Vector3(0, 1, 0);
const _qTilt = new Quaternion();
const _qYaw = new Quaternion();
const _yawScratch = new Vector3();

/** World Y for shapes that live on the XZ plane in 2D view. */
export const FLAT_SHAPE_PLANE_Y = 0;

const FLAT_ON_XZ_KINDS: ReadonlySet<SceneObjectKind> = new Set([
  SceneObjectKind.Rectangle,
  SceneObjectKind.Ellipse,
  SceneObjectKind.Circle,
  SceneObjectKind.Line,
  SceneObjectKind.Polygon,
]);

const PLANE_POSITION_KINDS: ReadonlySet<SceneObjectKind> = new Set([
  ...FLAT_ON_XZ_KINDS,
  SceneObjectKind.Point,
]);

export function isPlanePositionShapeKind(kind: SceneObjectKind): boolean {
  return PLANE_POSITION_KINDS.has(kind);
}

export function isFlatOnXzKind(kind: SceneObjectKind): boolean {
  return FLAT_ON_XZ_KINDS.has(kind);
}

/**
 * Grid-plane yaw (world Y). `rotation.y` in snapshots is this angle, not XYZ euler Y
 * (after tilt X, euler Y would spin around world Z).
 */
export function setFlatOnXzYaw(object: Object3D, yaw: number): void {
  _qTilt.setFromAxisAngle(_axisX, FLAT_SHAPE_ROTATION_X);
  _qYaw.setFromAxisAngle(_axisY, yaw);
  object.quaternion.copy(_qYaw).multiply(_qTilt);
}

export function getFlatOnXzYaw(object: Object3D): number {
  _yawScratch.set(1, 0, 0).applyQuaternion(object.quaternion);
  return Math.atan2(_yawScratch.x, _yawScratch.z);
}

export function flatOnXzEulerFromYaw(yaw: number): EulerState {
  return { x: FLAT_SHAPE_ROTATION_X, y: yaw, z: 0 };
}

export function flatShapePosition(x: number, z: number): Vector3State {
  return { x, y: FLAT_SHAPE_PLANE_Y, z };
}

export function defaultFlatOnXzTransform(
  position?: Partial<Vector3State>,
): SceneObjectTransform {
  return {
    position: flatShapePosition(position?.x ?? 0, position?.z ?? 0),
    rotation: { x: FLAT_SHAPE_ROTATION_X, y: 0, z: 0 },
    scale: { x: 1, y: 1, z: 1 },
  };
}

/** Ensures 2D shapes use Y=0 and XZ placement; flat kinds get grid-plane rotation. */
export function normalizeFlatShapeConfig<T extends SceneObjectConfig>(
  config: T,
): T {
  if (!isPlanePositionShapeKind(config.kind)) {
    return config;
  }

  const partial = config.transform;
  const position = flatShapePosition(
    partial?.position?.x ?? 0,
    partial?.position?.z ?? 0,
  );

  if (!isFlatOnXzKind(config.kind)) {
    return {
      ...config,
      transform: {
        position,
        rotation: partial?.rotation ?? { x: 0, y: 0, z: 0 },
        scale: partial?.scale ?? { x: 1, y: 1, z: 1 },
      },
    };
  }

  return {
    ...config,
    transform: {
      position,
      rotation: {
        x: partial?.rotation?.x ?? FLAT_SHAPE_ROTATION_X,
        y: partial?.rotation?.y ?? 0,
        z: partial?.rotation?.z ?? 0,
      },
      scale: partial?.scale ?? { x: 1, y: 1, z: 1 },
    },
  };
}
