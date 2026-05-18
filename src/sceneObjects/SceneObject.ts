import { Color, Mesh, Object3D, type Material } from "three";
import {
  SceneObjectKind,
  type EulerState,
  type SceneObjectSizeUpdate,
  type SceneObjectSnapshot,
  type SceneObjectTransform,
  type SceneObjectUpdate,
  type Vector3State,
} from "../types/sceneObjects.ts";
import {
  SCENE_OBJECT_ID_USER_DATA_KEY,
  type SceneObjectInit,
  type SceneObjectUserData,
} from "../types/sceneObjectRuntime.ts";
import {
  flatOnXzEulerFromYaw,
  getFlatOnXzYaw,
  isFlatOnXzKind,
  setFlatOnXzYaw,
} from "../utils/flatShapeTransform.ts";

export { SCENE_OBJECT_ID_USER_DATA_KEY } from "../types/sceneObjectRuntime.ts";
export type {
  SceneObjectInit,
  SceneObjectUserData,
} from "../types/sceneObjectRuntime.ts";
export { SceneObjectKind };

export default abstract class SceneObject extends Object3D {
  abstract readonly kind: SceneObjectKind;
  private _label: string;

  protected constructor({ label }: SceneObjectInit) {
    super();
    this._label = label;
    this.tagSceneObjectId();
  }

  get label(): string {
    return this._label;
  }

  set label(value: string) {
    this._label = value;
  }

  /** Walks ancestors to resolve the owning scene object id from a raycast hit. */
  static getSceneObjectIdFromObject3D(object: Object3D): number | null {
    let current: Object3D | null = object;

    while (current !== null) {
      const userData = current.userData as SceneObjectUserData;
      const id = userData[SCENE_OBJECT_ID_USER_DATA_KEY];
      if (id !== undefined) {
        return id;
      }

      current = current.parent;
    }

    return null;
  }

  getTransform(): SceneObjectTransform {
    return {
      position: this.toVector3State(this.position),
      rotation: isFlatOnXzKind(this.kind)
        ? flatOnXzEulerFromYaw(getFlatOnXzYaw(this))
        : this.toEulerState(this.rotation),
      scale: this.toVector3State(this.scale),
    };
  }

  applyTransform(input: Partial<SceneObjectTransform>): void {
    if (input.position !== undefined) {
      this.position.set(input.position.x, input.position.y, input.position.z);
    }

    if (input.rotation !== undefined) {
      if (isFlatOnXzKind(this.kind)) {
        setFlatOnXzYaw(this, input.rotation.y);
      } else {
        this.rotation.set(input.rotation.x, input.rotation.y, input.rotation.z);
      }
    }

    if (input.scale !== undefined) {
      this.scale.set(input.scale.x, input.scale.y, input.scale.z);
    }
  }

  getColor(): number {
    let colorHex: number | null = null;

    this.traverseColorMaterial((color) => {
      if (colorHex === null) {
        colorHex = color.getHex();
      }
    });

    return colorHex ?? 0xffffff;
  }

  setColor(color: number): void {
    this.traverseColorMaterial((materialColor) => {
      materialColor.setHex(color);
    });
  }

  applyUpdate(update: Omit<SceneObjectUpdate, "id">): void {
    if (update.label !== undefined) {
      this.label = update.label;
    }

    if (update.color !== undefined) {
      this.setColor(update.color);
    }

    if (update.transform !== undefined) {
      this.applyTransform(update.transform);
    }

    if (update.size !== undefined) {
      this.applySizeUpdate(update.size);
    }
  }

  abstract applySizeUpdate(size: SceneObjectSizeUpdate): void;

  abstract toSnapshot(): SceneObjectSnapshot;

  dispose(): void {
    this.parent?.remove(this);
    this.traverse((child) => {
      if (!(child instanceof Mesh)) {
        return;
      }
      child.geometry.dispose();
      this.disposeMaterial(child.material);
    });
  }

  /** Re-tags this subtree after adding or replacing child meshes. */
  protected tagSceneObjectId(): void {
    this.traverse((child) => {
      (child.userData as Record<string, number>)[
        SCENE_OBJECT_ID_USER_DATA_KEY
      ] = this.id;
    });
  }

  protected toVector3State(position: {
    x: number;
    y: number;
    z: number;
  }): Vector3State {
    return { x: position.x, y: position.y, z: position.z };
  }

  protected toEulerState(rotation: {
    x: number;
    y: number;
    z: number;
  }): EulerState {
    return { x: rotation.x, y: rotation.y, z: rotation.z };
  }

  protected traverseColorMaterial(callback: (color: Color) => void): void {
    this.traverse((child) => {
      if (!(child instanceof Mesh)) {
        return;
      }
      const materials = Array.isArray(child.material)
        ? child.material
        : [child.material];

      for (const material of materials) {
        if (this.iscolorMaterial(material)) {
          callback(material.color);
        }
      }
    });
  }

  private iscolorMaterial(
    material: Material,
  ): material is Material & { color: Color } {
    return "color" in material && material.color instanceof Color;
  }

  private disposeMaterial(material: Material | Material[]): void {
    if (Array.isArray(material)) {
      for (const entry of material) {
        this.disposeMaterial(entry);
      }
      return;
    }

    material.dispose();
  }
}
