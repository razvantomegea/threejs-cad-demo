import Ellipsoid from "./Ellipsoid.ts";
import {
  SceneObjectKind,
  type SceneObjectSizeUpdate,
  type SceneObjectSnapshot,
  type SphereSize,
} from "../types/sceneObjects.ts";
import type { SceneObjectOptions } from "../types/sceneObjectRuntime.ts";

const DEFAULT_RADIUS = 0.5;

export default class Sphere extends Ellipsoid {
  readonly kind = SceneObjectKind.Sphere;
  private radius: number;

  constructor({
    label,
    color,
    transform,
    size,
  }: SceneObjectOptions<SphereSize>) {
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
    const update = size as Partial<SphereSize>;
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
      kind: SceneObjectKind.Sphere,
      color: this.getColor(),
      transform: this.getTransform(),
      size: { radius: this.radius },
    };
  }
}
