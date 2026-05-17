import type { SceneObjectTransform } from "./geometry.ts";
import type { SceneObjectSizeUpdate } from "./sizes.ts";

export interface SceneObjectUpdate {
  readonly label?: string;
  readonly color?: number;
  readonly transform?: Partial<SceneObjectTransform>;
  readonly size?: SceneObjectSizeUpdate;
}
