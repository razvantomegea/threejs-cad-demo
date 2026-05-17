/** Creatable shape kinds exposed to the editor UI and factory. */
export enum SceneObjectKind {
  Cube = "cube",
  Rectangle = "rectangle",
  Line = "line",
  Sphere = "sphere",
  Circle = "circle",
  Ellipse = "ellipse",
  Point = "point",
  Polygon = "polygon",
}

export type TransformMode = "translate" | "rotate" | "scale";
