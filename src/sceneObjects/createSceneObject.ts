import {
  SceneObjectKind,
  type SceneObjectConfig,
} from "../types/sceneObjects.ts";
import Circle from "./Circle.ts";
import Cube from "./Cube.ts";
import Ellipse from "./Ellipse.ts";
import Line from "./Line.ts";
import Point from "./Point.ts";
import Polygon from "./Polygon.ts";
import Rectangle from "./Rectangle.ts";
import type SceneObject from "./SceneObject.ts";
import Sphere from "./Sphere.ts";
import { normalizeFlatShapeConfig } from "../utils/flatShapeTransform.ts";

const KIND_DISPLAY_NAMES: Record<SceneObjectKind, string> = {
  [SceneObjectKind.Cube]: "Cube",
  [SceneObjectKind.Rectangle]: "Rectangle",
  [SceneObjectKind.Line]: "Line",
  [SceneObjectKind.Sphere]: "Sphere",
  [SceneObjectKind.Circle]: "Circle",
  [SceneObjectKind.Ellipse]: "Ellipse",
  [SceneObjectKind.Point]: "Point",
  [SceneObjectKind.Polygon]: "Polygon",
};

const labelCounters = new Map<SceneObjectKind, number>();

function nextDefaultLabel(kind: SceneObjectKind): string {
  const count = (labelCounters.get(kind) ?? 0) + 1;
  labelCounters.set(kind, count);
  return `${KIND_DISPLAY_NAMES[kind]} ${count}`;
}

/** Builds a shape instance from editor config. Assigns default label when omitted. */
export default function createSceneObject(
  config: SceneObjectConfig,
): SceneObject {
  const normalized = normalizeFlatShapeConfig(config);
  const label = normalized.label ?? nextDefaultLabel(normalized.kind);
  const { color, transform } = normalized;

  switch (normalized.kind) {
    case SceneObjectKind.Cube:
      return new Cube({ label, color, transform, size: normalized.size });
    case SceneObjectKind.Rectangle:
      return new Rectangle({ label, color, transform, size: normalized.size });
    case SceneObjectKind.Line:
      return new Line({ label, color, transform, size: normalized.size });
    case SceneObjectKind.Sphere:
      return new Sphere({ label, color, transform, size: normalized.size });
    case SceneObjectKind.Circle:
      return new Circle({ label, color, transform, size: normalized.size });
    case SceneObjectKind.Ellipse:
      return new Ellipse({ label, color, transform, size: normalized.size });
    case SceneObjectKind.Point:
      return new Point({ label, color, transform, size: normalized.size });
    case SceneObjectKind.Polygon:
      return new Polygon({ label, color, transform, size: normalized.size });
    default: {
      const _exhaustive: never = normalized;
      return _exhaustive;
    }
  }
}
