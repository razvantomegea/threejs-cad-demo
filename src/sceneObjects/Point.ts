import Ellipsoid from "./Ellipsoid.ts";
import {
  SceneObjectKind,
  type PointSize,
  type SceneObjectSizeUpdate,
  type SceneObjectSnapshot,
} from "../types/sceneObjects.ts";
import type { SceneObjectOptions } from "../types/sceneObjectRuntime.ts";

const DEFAULT_RADIUS = 0.05;
const DEFAULT_COLOR = 0xffff44;

export default class Point extends Ellipsoid {
  readonly kind = SceneObjectKind.Point;
  private radius: number;

  constructor({
    label,
    color = DEFAULT_COLOR,
    transform,
    size,
  }: SceneObjectOptions<PointSize>) {
    const radius = size?.radius ?? DEFAULT_RADIUS;
    super({
      label,
      color,
      transform,
      size: { radiusX: radius, radiusY: radius, radiusZ: radius },
    });
    this.radius = radius;
  }

  applySizeUpdate(size: SceneObjectSizeUpdate): void {
    const update = size as Partial<PointSize>;
    if (update.radius === undefined) {
      return;
    }

    this.radius = update.radius;
    this.replaceGeometry({
      radiusX: this.radius,
      radiusY: this.radius,
      radiusZ: this.radius,
    });
  }

  toSnapshot(): SceneObjectSnapshot {
    return {
      id: this.id,
      label: this.label,
      kind: SceneObjectKind.Point,
      color: this.getColor(),
      transform: this.getTransform(),
      size: { radius: this.radius },
    };
  }
}
