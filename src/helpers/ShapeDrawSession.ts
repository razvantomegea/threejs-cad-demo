import { Vector3 } from "three";
import { SCENE_GRID_PLANE_Y } from "../constants/sceneGrid";
import {
  FLAT_RECT_DEPTH,
  FLAT_SHAPE_ROTATION_X,
  MIN_ELLIPSE_RADIUS_X,
  MIN_ELLIPSE_RADIUS_Y,
  MIN_RECT_HEIGHT,
  MIN_RECT_WIDTH,
} from "../constants/sceneDraw";
import { SceneObjectKind } from "../types/sceneObjects";
import type { DrawTool } from "../types/sceneDraw";
import type {
  EllipseSize,
  RectangleSize,
  SceneObjectConfig,
  SceneObjectUpdate,
  Vector3State,
} from "../types/sceneObjects";

export interface DrawPreviewTransform {
  readonly position: Vector3State;
  readonly scale: Vector3State;
}

export interface BakedDrawResult {
  readonly size: RectangleSize | EllipseSize;
  readonly position: Vector3State;
}

function groundSpan(anchor: Vector3, current: Vector3): {
  readonly width: number;
  readonly depthOnGround: number;
  readonly centerX: number;
  readonly centerZ: number;
} {
  const width = Math.max(MIN_RECT_WIDTH, Math.abs(current.x - anchor.x));
  const depthOnGround = Math.max(MIN_RECT_HEIGHT, Math.abs(current.z - anchor.z));

  return {
    width,
    depthOnGround,
    centerX: (anchor.x + current.x) / 2,
    centerZ: (anchor.z + current.z) / 2,
  };
}

function centerYOnPlane(): number {
  return SCENE_GRID_PLANE_Y + FLAT_RECT_DEPTH / 2;
}

export function createDrawObjectConfig(
  tool: DrawTool,
  anchor: Vector3,
): SceneObjectConfig {
  const preview = computeDrawPreviewTransform(tool, anchor, anchor);

  const base = {
    transform: {
      position: preview.position,
      rotation: { x: FLAT_SHAPE_ROTATION_X, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 },
    },
  };

  if (tool === SceneObjectKind.Rectangle) {
    return {
      ...base,
      kind: SceneObjectKind.Rectangle,
      size: { width: MIN_RECT_WIDTH, height: MIN_RECT_HEIGHT },
    };
  }

  return {
    ...base,
    kind: SceneObjectKind.Ellipse,
    size: { radiusX: MIN_ELLIPSE_RADIUS_X, radiusY: MIN_ELLIPSE_RADIUS_Y },
  };
}

export function computeDrawPreviewTransform(
  tool: DrawTool,
  anchor: Vector3,
  current: Vector3,
): DrawPreviewTransform {
  const { width, depthOnGround, centerX, centerZ } = groundSpan(anchor, current);

  if (tool === SceneObjectKind.Rectangle) {
    return {
      position: { x: centerX, y: centerYOnPlane(), z: centerZ },
      scale: {
        x: width / MIN_RECT_WIDTH,
        y: depthOnGround / MIN_RECT_HEIGHT,
        z: 1,
      },
    };
  }

  return {
    position: { x: centerX, y: centerYOnPlane(), z: centerZ },
    scale: {
      x: width / 2 / MIN_ELLIPSE_RADIUS_X,
      y: depthOnGround / 2 / MIN_ELLIPSE_RADIUS_Y,
      z: 1,
    },
  };
}

export function bakeDrawFromScale(
  tool: DrawTool,
  scale: Vector3State,
  position: Vector3State,
): BakedDrawResult {
  if (tool === SceneObjectKind.Rectangle) {
    return {
      size: {
        width: MIN_RECT_WIDTH * scale.x,
        height: MIN_RECT_HEIGHT * scale.y,
      },
      position,
    };
  }

  return {
    size: {
      radiusX: MIN_ELLIPSE_RADIUS_X * scale.x,
      radiusY: MIN_ELLIPSE_RADIUS_Y * scale.y,
    },
    position,
  };
}

export function toPreviewUpdate(
  preview: DrawPreviewTransform,
): SceneObjectUpdate {
  return {
    transform: {
      position: preview.position,
      scale: preview.scale,
    },
  };
}

export function toBakeUpdate(result: BakedDrawResult): SceneObjectUpdate {
  return {
    size: result.size,
    transform: {
      position: result.position,
      scale: { x: 1, y: 1, z: 1 },
    },
  };
}
