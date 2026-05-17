import type { ColorRepresentation } from "three";

export interface SceneGridColors {
  readonly minorColor: ColorRepresentation;
  readonly majorColor: ColorRepresentation;
  readonly axisXColor: ColorRepresentation;
  readonly axisYColor: ColorRepresentation;
  readonly axisZColor: ColorRepresentation;
}

export interface InfiniteGridOptions extends Partial<SceneGridColors> {
  readonly cellSize?: number;
  readonly sectionSize?: number;
  readonly planeExtent?: number;
  readonly fadeDistance?: number;
  readonly yOffset?: number;
  readonly axisLength?: number;
}
