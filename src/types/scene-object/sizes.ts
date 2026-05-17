import type { Vector3State } from "./geometry.ts";

export interface CubeSize {
  readonly size: number;
}

export interface RectangleSize {
  readonly width: number;
  readonly height: number;
}

export interface LineSize {
  readonly length: number;
  readonly thickness: number;
}

export interface SphereSize {
  readonly radius: number;
}

export interface CircleSize {
  readonly radius: number;
}

export interface EllipseSize {
  readonly radiusX: number;
  readonly radiusY: number;
}

export interface PointSize {
  readonly radius: number;
}

export interface PolygonSize {
  readonly points: readonly Vector3State[];
}

/** Discriminated size union keyed by object kind. */
export type SceneObjectSize =
  | CubeSize
  | RectangleSize
  | LineSize
  | SphereSize
  | CircleSize
  | EllipseSize
  | PointSize
  | PolygonSize;

/**
 * Partial size patch for `updateObject`.
 * Manager validates fields against the target object's kind.
 */
export type SceneObjectSizeUpdate =
  | Partial<CubeSize>
  | Partial<RectangleSize>
  | Partial<LineSize>
  | Partial<SphereSize>
  | Partial<CircleSize>
  | Partial<EllipseSize>
  | Partial<PointSize>
  | Partial<PolygonSize>;
