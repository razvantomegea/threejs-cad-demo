import Ellipsoid, { ELLIPSE_DISK_THICKNESS } from "./Ellipsoid.ts";
import {
  SceneObjectKind,
  type CircleSize,
  type SceneObjectSizeUpdate,
  type SceneObjectSnapshot,
} from "../types/sceneObjects.ts";
import type { SceneObjectOptions } from "../types/sceneObjectRuntime.ts";

const DEFAULT_RADIUS = 0.5;

export default class Circle extends Ellipsoid {
  readonly kind = SceneObjectKind.Circle;
  private radius: number;

  constructor({
    label,
    color,
    transform,
    size,
  }: SceneObjectOptions<CircleSize>) {
    const radius = size?.radius ?? DEFAULT_RADIUS;
    super({
      label,
      color,
      transform,
      size: {
        radiusX: radius,
        radiusY: radius,
        radiusZ: ELLIPSE_DISK_THICKNESS,
      },
    });
    this.radius = radius;
  }

  applySizeUpdate(size: SceneObjectSizeUpdate): void {
    const update = size as Partial<CircleSize>;
    if (update.radius === undefined) {
      return;
    }

    this.radius = update.radius;
    this.replaceGeometry({
      radiusX: this.radius,
      radiusY: this.radius,
      radiusZ: ELLIPSE_DISK_THICKNESS,
    });
  }

  toSnapshot(): SceneObjectSnapshot {
    return {
      id: this.id,
      label: this.label,
      kind: SceneObjectKind.Circle,
      color: this.getColor(),
      transform: this.getTransform(),
      size: { radius: this.radius },
    };
  }
}
