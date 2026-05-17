/** Unique identifier for a scene object instance. */
export type SceneObjectId = string;

/** Creatable shape kinds exposed to the editor UI and factory. */
export type SceneObjectKind =
  | "cube"
  | "rectangle"
  | "line"
  | "sphere"
  | "circle"
  | "ellipse"
  | "point"
  | "polygon";

export interface Vector3State {
  readonly x: number;
  readonly y: number;
  readonly z: number;
}

/** Euler rotation in radians (Three.js convention). */
export interface EulerState {
  readonly x: number;
  readonly y: number;
  readonly z: number;
}

export interface SceneObjectTransform {
  readonly position: Vector3State;
  readonly rotation: EulerState;
  readonly scale: Vector3State;
}

/** Partial transform used when creating or updating objects. */
export interface SceneObjectTransformInput {
  readonly position?: Vector3State;
  readonly rotation?: EulerState;
  readonly scale?: Vector3State;
}

export type TransformMode = "translate" | "rotate" | "scale";

export interface CubeSize {
  readonly size: number;
}

export interface RectangleSize {
  readonly width: number;
  readonly height: number;
}

export interface LineSize {
  readonly length: number;
  readonly thickness: number;
}

export interface SphereSize {
  readonly radius: number;
}

export interface CircleSize {
  readonly radius: number;
}

export interface EllipseSize {
  readonly radiusX: number;
  readonly radiusY: number;
}

export interface PointSize {
  readonly radius: number;
}

export interface PolygonSize {
  readonly points: readonly Vector3State[];
}

/** Discriminated size union keyed by object kind. */
export type SceneObjectSize =
  | CubeSize
  | RectangleSize
  | LineSize
  | SphereSize
  | CircleSize
  | EllipseSize
  | PointSize
  | PolygonSize;

/**
 * Partial size patch for `updateObject`.
 * Manager validates fields against the target object's kind.
 */
export type SceneObjectSizeUpdate =
  | Partial<CubeSize>
  | Partial<RectangleSize>
  | Partial<LineSize>
  | Partial<SphereSize>
  | Partial<CircleSize>
  | Partial<EllipseSize>
  | Partial<PointSize>
  | Partial<PolygonSize>;

interface SceneObjectConfigBase {
  readonly id?: SceneObjectId;
  readonly label?: string;
  /** Hex color (e.g. `0xff0000`). */
  readonly color?: number;
  readonly transform?: SceneObjectTransformInput;
}

export type SceneObjectConfig =
  | (SceneObjectConfigBase & {
    readonly kind: "cube";
    readonly size?: Partial<CubeSize>;
  })
  | (SceneObjectConfigBase & {
    readonly kind: "rectangle";
    readonly size?: Partial<RectangleSize>;
  })
  | (SceneObjectConfigBase & {
    readonly kind: "line";
    readonly size?: Partial<LineSize>;
  })
  | (SceneObjectConfigBase & {
    readonly kind: "sphere";
    readonly size?: Partial<SphereSize>;
  })
  | (SceneObjectConfigBase & {
    readonly kind: "circle";
    readonly size?: Partial<CircleSize>;
  })
  | (SceneObjectConfigBase & {
    readonly kind: "ellipse";
    readonly size?: Partial<EllipseSize>;
  })
  | (SceneObjectConfigBase & {
    readonly kind: "point";
    readonly size?: Partial<PointSize>;
  })
  | (SceneObjectConfigBase & {
    readonly kind: "polygon";
    readonly size?: Partial<PolygonSize>;
  });

export interface SceneObjectUpdate {
  readonly id: SceneObjectId;
  readonly label?: string;
  readonly color?: number;
  readonly transform?: SceneObjectTransformInput;
  readonly size?: SceneObjectSizeUpdate;
}

interface SceneObjectSnapshotBase {
  readonly id: SceneObjectId;
  readonly label: string;
  readonly color: number;
  readonly transform: SceneObjectTransform;
}

export type SceneObjectSnapshot =
  | (SceneObjectSnapshotBase & { readonly kind: "cube"; readonly size: CubeSize })
  | (SceneObjectSnapshotBase & {
    readonly kind: "rectangle";
    readonly size: RectangleSize;
  })
  | (SceneObjectSnapshotBase & { readonly kind: "line"; readonly size: LineSize })
  | (SceneObjectSnapshotBase & {
    readonly kind: "sphere";
    readonly size: SphereSize;
  })
  | (SceneObjectSnapshotBase & {
    readonly kind: "circle";
    readonly size: CircleSize;
  })
  | (SceneObjectSnapshotBase & {
    readonly kind: "ellipse";
    readonly size: EllipseSize;
  })
  | (SceneObjectSnapshotBase & { readonly kind: "point"; readonly size: PointSize })
  | (SceneObjectSnapshotBase & {
    readonly kind: "polygon";
    readonly size: PolygonSize;
  });

/** Manager + React subscription payload. */
export interface SceneEditorSnapshot {
  readonly objects: readonly SceneObjectSnapshot[];
  readonly selectedId: SceneObjectId | null;
  readonly transformMode: TransformMode;
}
