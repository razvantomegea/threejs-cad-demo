import {
  AxesHelper,
  Color,
  DoubleSide,
  Group,
  Mesh,
  PlaneGeometry,
  ShaderMaterial,
  Uniform,
  Vector3,
  type Camera,
} from "three";
import type { InfiniteGridOptions } from "../types/sceneGrid";
import { DEFAULT_SCENE_GRID } from "../constants/sceneGrid";

const VERTEX_SHADER = /* glsl */ `
varying vec3 vWorldPosition;

void main() {
  vec4 worldPosition = modelMatrix * vec4(position, 1.0);
  vWorldPosition = worldPosition.xyz;
  gl_Position = projectionMatrix * viewMatrix * worldPosition;
}
`;

const FRAGMENT_SHADER = /* glsl */ `
uniform float uCellSize;
uniform float uSectionSize;
uniform float uFadeDistance;
uniform vec3 uMinorColor;
uniform vec3 uMajorColor;
uniform vec3 uAxisXColor;
uniform vec3 uAxisZColor;
uniform vec3 uCameraPosition;

varying vec3 vWorldPosition;

float gridLine(vec2 coord, float size) {
  vec2 grid = abs(fract(coord / size - 0.5) - 0.5) / fwidth(coord);
  return 1.0 - min(grid.x, grid.y);
}

void main() {
  vec2 coord = vWorldPosition.xz;

  float minor = gridLine(coord, uCellSize);
  float major = gridLine(coord, uSectionSize);

  vec3 color = uMinorColor;
  float strength = minor * 0.2;

  if (major > 0.01) {
    color = uMajorColor;
    strength = max(strength, major * 0.1);
  }

  float axisX = 1.0 - smoothstep(0.0, 0.02, abs(coord.x));
  float axisZ = 1.0 - smoothstep(0.0, 0.02, abs(coord.y));
  if (axisX > 0.01) {
    color = uAxisXColor;
    strength = max(strength, axisX);
  }
  if (axisZ > 0.01) {
    color = uAxisZColor;
    strength = max(strength, axisZ);
  }

  float dist = distance(coord, uCameraPosition.xz);
  float fade = 1.0 - smoothstep(uFadeDistance * 0.75, uFadeDistance, dist);
  float alpha = clamp(strength * fade, 0.0, 1.0);

  if (alpha < 0.01) {
    discard;
  }

  gl_FragColor = vec4(color, alpha);
}
`;

interface ResolvedGridOptions {
  readonly cellSize: number;
  readonly sectionSize: number;
  readonly planeExtent: number;
  readonly fadeDistance: number;
  readonly yOffset: number;
  readonly axisLength: number;
  readonly minorColor: Color;
  readonly majorColor: Color;
  readonly axisXColor: Color;
  readonly axisYColor: Color;
  readonly axisZColor: Color;
}

function resolveOptions(
  options: InfiniteGridOptions = {},
): ResolvedGridOptions {
  return {
    cellSize: options.cellSize ?? DEFAULT_SCENE_GRID.cellSize,
    sectionSize: options.sectionSize ?? DEFAULT_SCENE_GRID.sectionSize,
    planeExtent: options.planeExtent ?? DEFAULT_SCENE_GRID.planeExtent,
    fadeDistance: options.fadeDistance ?? DEFAULT_SCENE_GRID.fadeDistance,
    yOffset: options.yOffset ?? DEFAULT_SCENE_GRID.yOffset,
    axisLength: options.axisLength ?? DEFAULT_SCENE_GRID.axisLength,
    minorColor: new Color(options.minorColor ?? DEFAULT_SCENE_GRID.minorColor),
    majorColor: new Color(options.majorColor ?? DEFAULT_SCENE_GRID.majorColor),
    axisXColor: new Color(options.axisXColor ?? DEFAULT_SCENE_GRID.axisXColor),
    axisYColor: new Color(options.axisYColor ?? DEFAULT_SCENE_GRID.axisYColor),
    axisZColor: new Color(options.axisZColor ?? DEFAULT_SCENE_GRID.axisZColor),
  };
}

function toVec3(color: Color): Vector3 {
  return new Vector3(color.r, color.g, color.b);
}

export class InfiniteGridHelper extends Group {
  private readonly options: ResolvedGridOptions;
  private readonly gridMesh: Mesh;
  private readonly gridMaterial: ShaderMaterial;
  private readonly axes: AxesHelper;
  private readonly uCameraPosition: Uniform<Vector3>;

  constructor(options: InfiniteGridOptions = {}) {
    super();

    this.options = resolveOptions(options);
    const {
      cellSize,
      sectionSize,
      planeExtent,
      fadeDistance,
      yOffset,
      axisLength,
      minorColor,
      majorColor,
      axisXColor,
      axisZColor,
    } = this.options;

    this.uCameraPosition = new Uniform(new Vector3());

    this.gridMaterial = new ShaderMaterial({
      uniforms: {
        uCellSize: new Uniform(cellSize),
        uSectionSize: new Uniform(sectionSize),
        uFadeDistance: new Uniform(fadeDistance),
        uMinorColor: new Uniform(toVec3(minorColor)),
        uMajorColor: new Uniform(toVec3(majorColor)),
        uAxisXColor: new Uniform(toVec3(axisXColor)),
        uAxisZColor: new Uniform(toVec3(axisZColor)),
        uCameraPosition: this.uCameraPosition,
      },
      vertexShader: VERTEX_SHADER,
      fragmentShader: FRAGMENT_SHADER,
      transparent: true,
      depthWrite: false,
      side: DoubleSide,
    });

    const geometry = new PlaneGeometry(planeExtent, planeExtent);
    this.gridMesh = new Mesh(geometry, this.gridMaterial);
    this.gridMesh.rotation.x = -Math.PI / 2;
    this.gridMesh.position.y = yOffset;
    this.gridMesh.renderOrder = -1000;
    this.gridMesh.frustumCulled = false;
    this.add(this.gridMesh);

    this.axes = new AxesHelper(axisLength);
    this.add(this.axes);
  }

  update(camera: Camera): void {
    const { cellSize, yOffset } = this.options;
    this.gridMesh.position.x =
      Math.floor(camera.position.x / cellSize) * cellSize;
    this.gridMesh.position.z =
      Math.floor(camera.position.z / cellSize) * cellSize;
    this.gridMesh.position.y = yOffset;
    this.uCameraPosition.value.copy(camera.position);
  }

  dispose(): void {
    this.gridMesh.geometry.dispose();
    this.gridMaterial.dispose();
    this.axes.dispose();
    this.remove(this.gridMesh);
    this.remove(this.axes);
  }
}
