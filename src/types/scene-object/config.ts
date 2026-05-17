import { SceneObjectKind } from "./core.ts";
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

interface SceneObjectConfigBase {
  readonly label?: string;
  /** Hex color (e.g. `0xff0000`). */
  readonly color?: number;
  readonly transform?: Partial<SceneObjectTransform>;
}

export type SceneObjectConfig =
  | (SceneObjectConfigBase & {
    readonly kind: SceneObjectKind.Cube;
    readonly size?: Partial<CubeSize>;
  })
  | (SceneObjectConfigBase & {
    readonly kind: SceneObjectKind.Rectangle;
    readonly size?: Partial<RectangleSize>;
  })
  | (SceneObjectConfigBase & {
    readonly kind: SceneObjectKind.Line;
    readonly size?: Partial<LineSize>;
  })
  | (SceneObjectConfigBase & {
    readonly kind: SceneObjectKind.Sphere;
    readonly size?: Partial<SphereSize>;
  })
  | (SceneObjectConfigBase & {
    readonly kind: SceneObjectKind.Circle;
    readonly size?: Partial<CircleSize>;
  })
  | (SceneObjectConfigBase & {
    readonly kind: SceneObjectKind.Ellipse;
    readonly size?: Partial<EllipseSize>;
  })
  | (SceneObjectConfigBase & {
    readonly kind: SceneObjectKind.Point;
    readonly size?: Partial<PointSize>;
  })
  | (SceneObjectConfigBase & {
    readonly kind: SceneObjectKind.Polygon;
    readonly size?: Partial<PolygonSize>;
  });
