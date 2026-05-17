import Cuboid from "./Cuboid.ts";
import {
  SceneObjectKind,
  type LineSize,
  type SceneObjectSizeUpdate,
  type SceneObjectSnapshot,
} from "../types/sceneObjects.ts";
import type { SceneObjectOptions } from "../types/sceneObjectRuntime.ts";

const DEFAULT_LENGTH = 2;
const DEFAULT_THICKNESS = 0.1;

export default class Line extends Cuboid {
  readonly kind = SceneObjectKind.Line;
  private length: number;
  private thickness: number;

  constructor({ label, color, transform, size }: SceneObjectOptions<LineSize>) {
    const length = size?.length ?? DEFAULT_LENGTH;
    const thickness = size?.thickness ?? DEFAULT_THICKNESS;
    super({
      label,
      color,
      transform,
      size: { width: length, height: thickness, depth: thickness },
    });
    this.length = length;
    this.thickness = thickness;
  }

  applySizeUpdate(size: SceneObjectSizeUpdate): void {
    const update = size as Partial<LineSize>;
    const length = update.length;
    const thickness = update.thickness;
    if (length === undefined && thickness === undefined) {
      return;
    }

    this.length = length ?? this.length;
    this.thickness = thickness ?? this.thickness;
    this.replaceGeometry({
      width: this.length,
      height: this.thickness,
      depth: this.thickness,
    });
  }

  toSnapshot(): SceneObjectSnapshot {
    return {
      id: this.id,
      label: this.label,
      kind: SceneObjectKind.Line,
      color: this.getColor(),
      transform: this.getTransform(),
      size: { length: this.length, thickness: this.thickness },
    };
  }
}
