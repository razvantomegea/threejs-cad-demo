import { Color, Mesh, Object3D, type Material } from "three";
import type {
  EulerState,
  SceneObjectId,
  SceneObjectKind,
  SceneObjectSizeUpdate,
  SceneObjectSnapshot,
  SceneObjectTransform,
  SceneObjectTransformInput,
  SceneObjectUpdate,
  Vector3State,
} from "../types/sceneObjects.ts";

export const SCENE_OBJECT_ID_USER_DATA_KEY = "sceneObjectId" as const;

export interface SceneObjectUserData {
  readonly [SCENE_OBJECT_ID_USER_DATA_KEY]?: SceneObjectId;
}

export interface SceneObjectInit {
  readonly id: SceneObjectId;
  readonly label: string;
}

function isColorWritableMaterial(
  material: Material
): material is Material & { color: Color } {
  return "color" in material && material.color instanceof Color;
}

function toVector3State(
  position: { x: number; y: number; z: number }
): Vector3State {
  return { x: position.x, y: position.y, z: position.z };
}

function toEulerState(rotation: {
  x: number;
  y: number;
  z: number;
}): EulerState {
  return { x: rotation.x, y: rotation.y, z: rotation.z };
}

function updateMaterialColor(
  object: Object3D,
  callback: (color: Color) => void
): void {
  object.traverse((child) => {
    if (!(child instanceof Mesh)) {
      return;
    }
    const materials = Array.isArray(child.material)
      ? child.material
      : [child.material];

    for (const material of materials) {
      if (isColorWritableMaterial(material)) {
        callback(material.color);
      }
    }
  });
}

/** Walks ancestors to resolve the owning scene object id from a raycast hit. */
export function getSceneObjectIdFromObject3D(
  object: Object3D
): SceneObjectId | null {
  let current: Object3D | null = object;
  while (current !== null) {
    const userData = current.userData as SceneObjectUserData;
    const sceneObjectId = userData[SCENE_OBJECT_ID_USER_DATA_KEY];
    if (sceneObjectId !== undefined) {
      return sceneObjectId;
    }
    current = current.parent;
  }
  return null;
}

export default abstract class SceneObject extends Object3D {
  /** App-level id; Three's numeric `Object3D.id` stays separate. */
  readonly sceneObjectId: SceneObjectId;
  abstract readonly kind: SceneObjectKind;

  private _label: string;

  protected constructor(init: SceneObjectInit) {
    super();
    this.sceneObjectId = init.id;
    this._label = init.label;
    this.tagSceneObjectId();
  }

  get label(): string {
    return this._label;
  }

  set label(value: string) {
    this._label = value;
  }

  getTransform(): SceneObjectTransform {
    return {
      position: toVector3State(this.position),
      rotation: toEulerState(this.rotation),
      scale: toVector3State(this.scale),
    };
  }

  applyTransformInput(input: SceneObjectTransformInput): void {
    if (input.position !== undefined) {
      this.position.set(
        input.position.x,
        input.position.y,
        input.position.z
      );
    }

    if (input.rotation !== undefined) {
      this.rotation.set(
        input.rotation.x,
        input.rotation.y,
        input.rotation.z
      );
    }

    if (input.scale !== undefined) {
      this.scale.set(input.scale.x, input.scale.y, input.scale.z);
    }
  }

  getColor(): number {
    let colorHex: number | null = null;
    updateMaterialColor(this, (color) => {
      if (colorHex === null) {
        colorHex = color.getHex();
      }
    });
    return colorHex ?? 0xffffff;
  }

  setColor(color: number): void {
    updateMaterialColor(this, (materialColor) => {
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
      this.applyTransformInput(update.transform);
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

  private disposeMaterial(material: Material | Material[]): void {
    if (Array.isArray(material)) {
      for (const entry of material) {
        this.disposeMaterial(entry);
      }

      return;
    }

    material.dispose();
  }

  /** Re-tags this subtree after adding or replacing child meshes. */
  protected tagSceneObjectId(): void {
    this.traverse((child) => {
      (child.userData as Record<string, SceneObjectId>)[
        SCENE_OBJECT_ID_USER_DATA_KEY
      ] = this.sceneObjectId;
    });
  }
}
