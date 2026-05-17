import Cuboid from "./Cuboid.ts";
import {
  SceneObjectKind,
  type CubeSize,
  type SceneObjectSizeUpdate,
  type SceneObjectSnapshot,
} from "../types/sceneObjects.ts";
import type { SceneObjectOptions } from "../types/sceneObjectRuntime.ts";

const DEFAULT_EDGE = 1;

export default class Cube extends Cuboid {
  readonly kind = SceneObjectKind.Cube;
  private cubeSize: number;

  constructor({ label, color, transform, size }: SceneObjectOptions<CubeSize>) {
    const cubeSize = size?.edge ?? DEFAULT_EDGE;
    super({
      label,
      color,
      transform,
      size: { width: cubeSize, height: cubeSize, depth: cubeSize },
    });
    this.cubeSize = cubeSize;
  }

  applySizeUpdate(size: SceneObjectSizeUpdate): void {
    const update = size as Partial<CubeSize>;
    if (update.edge === undefined) {
      return;
    }

    this.cubeSize = update.edge;
    this.replaceGeometry({
      width: this.cubeSize,
      height: this.cubeSize,
      depth: this.cubeSize,
    });
  }

  toSnapshot(): SceneObjectSnapshot {
    return {
      id: this.id,
      label: this.label,
      kind: SceneObjectKind.Cube,
      color: this.getColor(),
      transform: this.getTransform(),
      size: { edge: this.cubeSize },
    };
  }
}
