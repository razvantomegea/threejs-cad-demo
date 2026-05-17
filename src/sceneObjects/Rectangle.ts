import Cuboid from "./Cuboid.ts";
import {
  SceneObjectKind,
  type RectangleSize,
  type SceneObjectSizeUpdate,
  type SceneObjectSnapshot,
} from "../types/sceneObjects.ts";
import type { SceneObjectOptions } from "../types/sceneObjectRuntime.ts";

const DEFAULT_WIDTH = 2;
const DEFAULT_HEIGHT = 1;
const DEPTH = 0.05;

export default class Rectangle extends Cuboid {
  readonly kind = SceneObjectKind.Rectangle;
  private width: number;
  private height: number;

  constructor({ label, color, transform, size }: SceneObjectOptions<RectangleSize>) {
    const width = size?.width ?? DEFAULT_WIDTH;
    const height = size?.height ?? DEFAULT_HEIGHT;
    super({ label, color, transform, size: { width, height, depth: DEPTH } });
    this.width = width;
    this.height = height;
  }

  applySizeUpdate(size: SceneObjectSizeUpdate): void {
    const update = size as Partial<RectangleSize>;
    const width = update.width;
    const height = update.height;
    if (width === undefined && height === undefined) {
      return;
    }

    this.width = width ?? this.width;
    this.height = height ?? this.height;
    this.replaceGeometry({
      width: this.width,
      height: this.height,
      depth: DEPTH,
    });
  }

  toSnapshot(): SceneObjectSnapshot {
    return {
      id: this.id,
      label: this.label,
      kind: SceneObjectKind.Rectangle,
      color: this.getColor(),
      transform: this.getTransform(),
      size: { width: this.width, height: this.height },
    };
  }
}
