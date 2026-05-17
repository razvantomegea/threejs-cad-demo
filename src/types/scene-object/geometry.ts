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