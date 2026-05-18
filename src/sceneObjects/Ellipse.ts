import Ellipsoid, { ELLIPSE_DISK_THICKNESS } from "./Ellipsoid.ts";
import {
  SceneObjectKind,
  type EllipseSize,
  type SceneObjectSizeUpdate,
  type SceneObjectSnapshot,
} from "../types/sceneObjects.ts";
import type { SceneObjectOptions } from "../types/sceneObjectRuntime.ts";

const DEFAULT_RADIUS_X = 1;
const DEFAULT_RADIUS_Y = 0.5;

export default class Ellipse extends Ellipsoid {
  readonly kind = SceneObjectKind.Ellipse;
  private radiusX: number;
  private radiusY: number;

  constructor({
    label,
    color,
    transform,
    size,
  }: SceneObjectOptions<EllipseSize>) {
    const radiusX = size?.radiusX ?? DEFAULT_RADIUS_X;
    const radiusY = size?.radiusY ?? DEFAULT_RADIUS_Y;
    super({
      label,
      color,
      transform,
      size: { radiusX, radiusY, radiusZ: ELLIPSE_DISK_THICKNESS },
    });
    this.radiusX = radiusX;
    this.radiusY = radiusY;
  }

  applySizeUpdate(size: SceneObjectSizeUpdate): void {
    // Manager validates size type matches object kind before calling
    const update = size as Partial<EllipseSize>;
    const radiusX = update.radiusX;
    const radiusY = update.radiusY;

    if (radiusX === undefined && radiusY === undefined) {
      return;
    }

    this.radiusX = radiusX ?? this.radiusX;
    this.radiusY = radiusY ?? this.radiusY;
    this.replaceGeometry({
      radiusX: this.radiusX,
      radiusY: this.radiusY,
      radiusZ: ELLIPSE_DISK_THICKNESS,
    });
  }

  toSnapshot(): SceneObjectSnapshot {
    return {
      id: this.id,
      label: this.label,
      kind: SceneObjectKind.Ellipse,
      color: this.getColor(),
      transform: this.getTransform(),
      size: { radiusX: this.radiusX, radiusY: this.radiusY },
    };
  }
}
