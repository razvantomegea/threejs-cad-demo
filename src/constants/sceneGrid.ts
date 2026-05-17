import type { InfiniteGridOptions } from "../types/sceneGrid";

export const DEFAULT_SCENE_GRID = {
  cellSize: 1,
  sectionSize: 10,
  planeExtent: 200,
  fadeDistance: 80,
  yOffset: -0.001,
  minorColor: 0x2a2a32,
  majorColor: 0x404050,
  axisXColor: 0x8b3a3a,
  axisYColor: 0x3a6b3a,
  axisZColor: 0x3a4a8b,
  axisLength: 5,
} as const satisfies InfiniteGridOptions;
