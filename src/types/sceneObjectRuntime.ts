import type { SceneObjectSize, SceneObjectTransform } from "./sceneObjects";

/** `Object3D.userData` key linking meshes to app-level scene object ids. */
export const SCENE_OBJECT_ID_USER_DATA_KEY = "id" as const;

export interface SceneObjectInit {
  readonly label: string;
}

export interface SceneObjectOptions<T extends SceneObjectSize> extends SceneObjectInit {
  readonly color?: number;
  readonly transform?: Partial<SceneObjectTransform>;
  readonly size?: Partial<T>;
}

export interface SceneObjectUserData {
  readonly [SCENE_OBJECT_ID_USER_DATA_KEY]?: number;
}
