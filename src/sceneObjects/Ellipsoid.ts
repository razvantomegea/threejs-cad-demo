import {
  Mesh,
  MeshBasicMaterial,
  SphereGeometry,
  type BufferGeometry,
} from "three";
import SceneObject from "./SceneObject.ts";
import type { SceneObjectOptions } from "../types/sceneObjectRuntime.ts";

export interface EllipsoidRadii {
  readonly radiusX: number;
  readonly radiusY: number;
  readonly radiusZ: number;
}

/** Flat-disk depth for Circle / Ellipse (unit sphere scaled on Z). */
export const ELLIPSE_DISK_THICKNESS = 0.05;

const DEFAULT_SHAPE_COLOR = 0x4a90d9;

export type EllipsoidOptions = SceneObjectOptions<EllipsoidRadii> & {
  readonly size: EllipsoidRadii;
};

export default abstract class Ellipsoid extends SceneObject {
  protected readonly mesh: Mesh;
  private radii: EllipsoidRadii;

  protected constructor({
    label,
    color = DEFAULT_SHAPE_COLOR,
    size,
    transform,
  }: EllipsoidOptions) {
    super({ label });

    if (
      !Number.isFinite(size.radiusX) ||
      !Number.isFinite(size.radiusY) ||
      !Number.isFinite(size.radiusZ) ||
      size.radiusX <= 0 ||
      size.radiusY <= 0 ||
      size.radiusZ <= 0
    ) {
      throw new Error("Ellipsoid radii must be positive numbers");
    }

    this.radii = size;
    const geometry = this.createGeometry();
    this.mesh = new Mesh(geometry, new MeshBasicMaterial({ color }));
    this.mesh.scale.set(
      this.radii.radiusX,
      this.radii.radiusY,
      this.radii.radiusZ,
    );
    this.add(this.mesh);
    this.tagSceneObjectId();

    if (transform !== undefined) {
      this.applyTransform(transform);
    }
  }

  protected getRadii(): EllipsoidRadii {
    return this.radii;
  }

  protected createGeometry(): BufferGeometry {
    // Ellipsoid is the base for Sphere, Circle, and Ellipse. They all need non-uniform scaling:
    // Sphere: equal scale on X/Y/Z
    // Circle / Ellipse: thin Z via ELLIPSE_DISK_THICKNESS (0.05)
    // A single SphereGeometry with one radius cannot represent that; a unit sphere + per-axis scale can.
    // 1 is the radius of the unit sphere, 32 is the number of segments around the equator, and 16 is the number of segments around the poles.
    return new SphereGeometry(1, 32, 16);
  }

  protected replaceGeometry(radii: EllipsoidRadii): void {
    this.radii = radii;
    this.mesh.scale.set(radii.radiusX, radii.radiusY, radii.radiusZ);
  }
}
