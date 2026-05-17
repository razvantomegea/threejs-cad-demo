import { SceneObjectKind, type TransformMode } from "./core.ts";
import type { SceneObjectTransform } from "./geometry.ts";
import type {
  CircleSize,
  CubeSize,
  EllipseSize,
  LineSize,
  PointSize,
  PolygonSize,
  RectangleSize,
  SphereSize,
} from "./sizes.ts";

interface SceneObjectSnapshotBase {
  readonly id: number;
  readonly label: string;
  readonly color: number;
  readonly transform: SceneObjectTransform;
}

export type SceneObjectSnapshot =
  | (SceneObjectSnapshotBase & {
      readonly kind: SceneObjectKind.Cube;
      readonly size: CubeSize;
    })
  | (SceneObjectSnapshotBase & {
      readonly kind: SceneObjectKind.Rectangle;
      readonly size: RectangleSize;
    })
  | (SceneObjectSnapshotBase & {
      readonly kind: SceneObjectKind.Line;
      readonly size: LineSize;
    })
  | (SceneObjectSnapshotBase & {
      readonly kind: SceneObjectKind.Sphere;
      readonly size: SphereSize;
    })
  | (SceneObjectSnapshotBase & {
      readonly kind: SceneObjectKind.Circle;
      readonly size: CircleSize;
    })
  | (SceneObjectSnapshotBase & {
      readonly kind: SceneObjectKind.Ellipse;
      readonly size: EllipseSize;
    })
  | (SceneObjectSnapshotBase & {
      readonly kind: SceneObjectKind.Point;
      readonly size: PointSize;
    })
  | (SceneObjectSnapshotBase & {
      readonly kind: SceneObjectKind.Polygon;
      readonly size: PolygonSize;
    });

/** Manager + React subscription payload. */
export interface SceneEditorSnapshot {
  readonly objects: readonly SceneObjectSnapshot[];
  readonly selectedId: number | null;
  readonly transformMode: TransformMode;
}
