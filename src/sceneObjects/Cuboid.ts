import {
  BoxGeometry,
  Mesh,
  MeshBasicMaterial,
  type BufferGeometry,
} from "three";
import SceneObject from "./SceneObject.ts";
import type { SceneObjectOptions } from "../types/sceneObjectRuntime.ts";

export interface CuboidDimensions {
  readonly width: number;
  readonly height: number;
  readonly depth: number;
}

const DEFAULT_SHAPE_COLOR = 0x4a90d9;

export type CuboidOptions = SceneObjectOptions<CuboidDimensions> & {
  readonly size: CuboidDimensions;
};

export default abstract class Cuboid extends SceneObject {
  protected readonly mesh: Mesh;
  protected dimensions: CuboidDimensions;

  protected constructor({
    label,
    color = DEFAULT_SHAPE_COLOR,
    size,
    transform,
  }: CuboidOptions) {
    super({ label });
    this.dimensions = size;
    const geometry = this.createGeometry(this.dimensions);
    this.mesh = new Mesh(geometry, new MeshBasicMaterial({ color }));
    this.add(this.mesh);
    this.tagSceneObjectId();

    if (transform !== undefined) {
      this.applyTransform(transform);
    }
  }

  protected getDimensions(): CuboidDimensions {
    return this.dimensions;
  }

  protected createGeometry(dimensions: CuboidDimensions): BufferGeometry {
    return new BoxGeometry(
      dimensions.width,
      dimensions.height,
      dimensions.depth
    );
  }

  protected replaceGeometry(dimensions: CuboidDimensions): void {
    this.dimensions = dimensions;
    const previousGeometry = this.mesh.geometry;
    this.mesh.geometry = this.createGeometry(dimensions);
    previousGeometry.dispose();
  }
}
