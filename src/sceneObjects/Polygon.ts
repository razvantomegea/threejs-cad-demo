import {
  BoxGeometry,
  Mesh,
  MeshBasicMaterial,
  Quaternion,
  Vector3,
  type Material,
} from "three";
import SceneObject from "./SceneObject.ts";
import {
  SceneObjectKind,
  type PolygonSize,
  type SceneObjectSizeUpdate,
  type SceneObjectSnapshot,
  type Vector3State,
} from "../types/sceneObjects.ts";
import type { SceneObjectOptions } from "../types/sceneObjectRuntime.ts";

const DEFAULT_COLOR = 0x4a90d9;
const SEGMENT_THICKNESS = 0.05;
const DEFAULT_POINTS: readonly Vector3State[] = [
  { x: -0.5, y: -0.5, z: 0 },
  { x: 0.5, y: -0.5, z: 0 },
  { x: 0, y: 0.5, z: 0 },
];

const SEGMENT_AXIS = new Vector3(1, 0, 0);

export default class Polygon extends SceneObject {
  readonly kind = SceneObjectKind.Polygon;
  private points: Vector3State[];
  private segmentColor: number = DEFAULT_COLOR;

  constructor({
    label,
    color,
    transform,
    size,
  }: SceneObjectOptions<PolygonSize>) {
    super({ label });
    this.points = [...(size?.points ?? DEFAULT_POINTS)];
    this.setColor(color ?? DEFAULT_COLOR);
    this.rebuildSegments();

    if (transform !== undefined) {
      this.applyTransform(transform);
    }
  }

  applySizeUpdate(size: SceneObjectSizeUpdate): void {
    const update = size as Partial<PolygonSize>;
    if (update.points === undefined) {
      return;
    }

    this.points = [...update.points];
    this.rebuildSegments();
  }

  toSnapshot(): SceneObjectSnapshot {
    return {
      id: this.id,
      label: this.label,
      kind: SceneObjectKind.Polygon,
      color: this.getColor(),
      transform: this.getTransform(),
      size: { points: this.points.map((point) => ({ ...point })) },
    };
  }

  override setColor(color: number): void {
    this.segmentColor = color;
    super.setColor(color);
  }

  private rebuildSegments(): void {
    this.clearSegments();

    if (this.points.length < 2) {
      this.tagSceneObjectId();
      return;
    }

    const segmentCount = this.points.length;
    for (let index = 0; index < segmentCount; index += 1) {
      const start = this.points[index]!;
      const end = this.points[(index + 1) % segmentCount]!;
      this.add(this.createSegmentMesh(start, end, this.segmentColor));
    }

    this.tagSceneObjectId();
  }

  private clearSegments(): void {
    const segments = [...this.children];
    for (const segment of segments) {
      if (!(segment instanceof Mesh)) {
        continue;
      }

      segment.geometry.dispose();
      this.disposeSegmentMaterial(segment.material);
      this.remove(segment);
    }
  }

  private createSegmentMesh(
    start: Vector3State,
    end: Vector3State,
    color: number,
  ): Mesh {
    const startVector = new Vector3(start.x, start.y, start.z);
    const endVector = new Vector3(end.x, end.y, end.z);
    const direction = new Vector3().subVectors(endVector, startVector);
    const length = direction.length();

    const geometry =
      length < 1e-6
        ? new BoxGeometry(
            SEGMENT_THICKNESS,
            SEGMENT_THICKNESS,
            SEGMENT_THICKNESS,
          )
        : new BoxGeometry(length, SEGMENT_THICKNESS, SEGMENT_THICKNESS);

    const mesh = new Mesh(geometry, new MeshBasicMaterial({ color }));
    mesh.position.copy(startVector).add(endVector).multiplyScalar(0.5);

    if (length >= 1e-6) {
      const quaternion = new Quaternion().setFromUnitVectors(
        SEGMENT_AXIS,
        direction.normalize(),
      );
      mesh.setRotationFromQuaternion(quaternion);
    }

    return mesh;
  }

  private disposeSegmentMaterial(material: Material | Material[]): void {
    if (Array.isArray(material)) {
      for (const entry of material) {
        entry.dispose();
      }
      return;
    }

    material.dispose();
  }
}
