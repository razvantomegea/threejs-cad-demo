import { type Camera, Raycaster, type Scene, Vector2, Vector3 } from "three";
import { TransformControls } from "three/addons/controls/TransformControls.js";
import { SCENE_GRID_PLANE_Y } from "../constants/sceneGrid";
import createSceneObject from "../sceneObjects/createSceneObject.ts";
import SceneObject from "../sceneObjects/SceneObject.ts";
import type { SceneControlsHandle } from "../types/sceneControls.ts";
import type { DrawTool } from "../types/sceneDraw.ts";
import type {
  SceneEditorSnapshot,
  SceneObjectConfig,
  SceneObjectUpdate,
  TransformMode,
} from "../types/sceneObjects.ts";
import {
  bakeDrawFromScale,
  computeDrawPreviewTransform,
  createDrawObjectConfig,
  toBakeUpdate,
  toPreviewUpdate,
} from "./ShapeDrawSession.ts";
import {
  pickPointOnSceneGridPlane,
  pointerFromPointerEvent,
} from "../utils/sceneGridIntersection.ts";
import {
  getFlatOnXzYaw,
  isFlatOnXzKind,
  setFlatOnXzYaw,
} from "../utils/flatShapeTransform.ts";
import {
  captureRotationAxisLock,
  FLAT_ON_XZ_ROTATION_LOCK,
  rotationWithYAxisOnly,
  type RotationAxisLock,
} from "../utils/sceneRotationConstraint.ts";
import {
  capturePositionYLock,
  captureScaleYLock,
  FLAT_SHAPE_POSITION_Y_LOCK,
  positionOnXZPlane,
  scaleOnXZPlane,
  type PositionYLock,
  type ScaleYLock,
} from "../utils/sceneView2DConstraint.ts";

export type SceneObjectId = number;

type SnapshotListener = (snapshot: SceneEditorSnapshot) => void;

export interface SceneManagerOptions {
  readonly scene: Scene;
  readonly camera: Camera;
  readonly domElement: HTMLElement;
  readonly sceneControls: SceneControlsHandle;
}

const DEFAULT_TRANSFORM_MODE: TransformMode = "translate";

export class SceneManager {
  private readonly scene: Scene;
  private camera: Camera;
  private readonly domElement: HTMLElement;
  private readonly sceneControls: SceneControlsHandle;
  private readonly objects = new Map<SceneObjectId, SceneObject>();
  private readonly subscribers = new Set<SnapshotListener>();
  private readonly raycaster = new Raycaster();
  private readonly pointer = new Vector2();
  private readonly transformControls: TransformControls;
  private readonly drawAnchor = new Vector3();

  private selectedId: SceneObjectId | null = null;
  private transformMode: TransformMode = DEFAULT_TRANSFORM_MODE;
  private activeDrawTool: DrawTool | null = null;
  private drawingObjectId: SceneObjectId | null = null;
  private drawingPointerId: number | null = null;
  private restoreOrbitControls: (() => void) | null = null;
  private view2D = false;
  private readonly rotationAxisLocks = new Map<SceneObjectId, RotationAxisLock>();
  private readonly positionYLocks = new Map<SceneObjectId, PositionYLock>();
  private readonly scaleYLocks = new Map<SceneObjectId, ScaleYLock>();
  /** Grid-plane yaw for flat shapes; stable during translate/scale gizmo drags. */
  private readonly flatYawLocks = new Map<SceneObjectId, number>();
  private disposed = false;

  private readonly handlePointerDown = (event: PointerEvent): void => {
    if (
      this.disposed ||
      event.button !== 0 ||
      this.transformControls.dragging
    ) {
      return;
    }

    if (this.drawingObjectId !== null) {
      return;
    }

    if (this.activeDrawTool !== null) {
      this.startDraw(event);
      return;
    }

    pointerFromPointerEvent(event, this.domElement, this.pointer);
    this.raycaster.setFromCamera(this.pointer, this.camera);

    const roots = Array.from(this.objects.values());
    if (roots.length === 0) {
      this.selectObject(null);
      return;
    }

    const hits = this.raycaster.intersectObjects(roots, true);
    if (hits.length === 0) {
      this.selectObject(null);
      return;
    }

    const id = SceneObject.getSceneObjectIdFromObject3D(hits[0].object);
    this.selectObject(id);
  };

  private readonly handleDrawPointerMove = (event: PointerEvent): void => {
    if (this.drawingObjectId === null || this.activeDrawTool === null) {
      return;
    }

    pointerFromPointerEvent(event, this.domElement, this.pointer);
    const current = pickPointOnSceneGridPlane(
      this.raycaster,
      this.pointer,
      this.camera,
      SCENE_GRID_PLANE_Y,
    );
    if (current === null) {
      return;
    }

    const object = this.objects.get(this.drawingObjectId);
    if (object === undefined) {
      return;
    }

    const preview = computeDrawPreviewTransform(
      this.activeDrawTool,
      this.drawAnchor,
      current,
    );
    object.applyUpdate(toPreviewUpdate(preview));
    this.emitSnapshot();
  };

  private readonly handleDrawPointerUp = (event: PointerEvent): void => {
    if (event.button !== 0 || this.drawingObjectId === null) {
      return;
    }

    this.finishDraw();
  };

  private readonly handleTransformMouseDown = (): void => {
    if (this.restoreOrbitControls !== null) {
      return;
    }
    this.restoreOrbitControls = this.sceneControls.suspend();
  };

  private readonly handleTransformMouseUp = (): void => {
    this.restoreOrbitControls?.();
    this.restoreOrbitControls = null;
  };

  private readonly handleTransformObjectChange = (): void => {
    this.constrainSelectedObjectForView2D();
    this.emitSnapshot();
  };

  constructor({
    scene,
    camera,
    domElement,
    sceneControls,
  }: SceneManagerOptions) {
    this.scene = scene;
    this.camera = camera;
    this.domElement = domElement;
    this.sceneControls = sceneControls;

    this.transformControls = new TransformControls(camera, domElement);
    this.transformControls.setMode(DEFAULT_TRANSFORM_MODE);
    this.scene.add(this.transformControls.getHelper());

    this.transformControls.addEventListener(
      "mouseDown",
      this.handleTransformMouseDown,
    );
    this.transformControls.addEventListener(
      "mouseUp",
      this.handleTransformMouseUp,
    );
    this.transformControls.addEventListener(
      "objectChange",
      this.handleTransformObjectChange,
    );

    this.applyTransformGizmoForView();
    domElement.addEventListener("pointerdown", this.handlePointerDown);
  }

  setDrawTool(tool: DrawTool | null): void {
    if (this.activeDrawTool === tool) {
      return;
    }

    this.activeDrawTool = tool;
    this.emitSnapshot();
  }

  addObject(config: SceneObjectConfig): SceneObjectId {
    const object = createSceneObject(config);
    this.objects.set(object.id, object);
    this.scene.add(object);
    if (this.view2D) {
      this.captureTransformLocksForObject(object);
    }
    this.emitSnapshot();
    return object.id;
  }

  updateObject(id: SceneObjectId, update: SceneObjectUpdate): void {
    const object = this.objects.get(id);
    if (object === undefined) {
      return;
    }

    object.applyUpdate(this.sanitizeUpdateForView2D(id, object, update));
    if (this.view2D && isFlatOnXzKind(object.kind)) {
      this.flatYawLocks.set(id, getFlatOnXzYaw(object));
    }
    this.emitSnapshot();
  }

  setView2D(enabled: boolean): void {
    if (this.view2D === enabled) {
      return;
    }

    this.view2D = enabled;

    if (enabled) {
      this.captureAllTransformLocks();
      this.constrainSelectedObjectForView2D();
    } else {
      this.rotationAxisLocks.clear();
      this.positionYLocks.clear();
      this.scaleYLocks.clear();
      this.flatYawLocks.clear();
    }

    this.applyTransformGizmoForView();
    this.emitSnapshot();
  }

  removeObject(id: SceneObjectId): void {
    const object = this.objects.get(id);
    if (object === undefined) {
      return;
    }

    if (this.drawingObjectId === id) {
      this.cancelDrawSession();
    }

    if (this.selectedId === id) {
      this.transformControls.detach();
      this.selectedId = null;
    }

    object.dispose();
    this.objects.delete(id);
    this.emitSnapshot();
  }

  selectObject(id: SceneObjectId | null): void {
    if (id === this.selectedId) {
      this.emitSnapshot();
      return;
    }

    this.selectedId = id;

    if (id === null) {
      this.transformControls.detach();
      this.emitSnapshot();
      return;
    }

    const object = this.objects.get(id);
    if (object === undefined) {
      this.selectedId = null;
      this.transformControls.detach();
      this.emitSnapshot();
      return;
    }

    this.transformControls.attach(object);
    this.emitSnapshot();
  }

  setTransformMode(mode: TransformMode): void {
    if (this.transformMode === mode) {
      return;
    }

    this.transformMode = mode;
    this.transformControls.setMode(mode);
    this.applyTransformGizmoForView();
    this.emitSnapshot();
  }

  setCamera(camera: Camera): void {
    this.camera = camera;
    this.transformControls.camera = camera;
  }

  private rotationLockForObject(object: SceneObject): RotationAxisLock {
    if (isFlatOnXzKind(object.kind)) {
      return FLAT_ON_XZ_ROTATION_LOCK;
    }
    return captureRotationAxisLock(object.rotation);
  }

  private positionYLockForObject(object: SceneObject): PositionYLock {
    if (isFlatOnXzKind(object.kind)) {
      return FLAT_SHAPE_POSITION_Y_LOCK;
    }
    return capturePositionYLock(object.position.y);
  }

  private scaleYLockForObject(object: SceneObject): ScaleYLock {
    return captureScaleYLock(object.scale.y);
  }

  private captureTransformLocksForObject(object: SceneObject): void {
    this.rotationAxisLocks.set(object.id, this.rotationLockForObject(object));
    this.positionYLocks.set(object.id, this.positionYLockForObject(object));
    this.scaleYLocks.set(object.id, this.scaleYLockForObject(object));
    if (isFlatOnXzKind(object.kind)) {
      this.flatYawLocks.set(object.id, getFlatOnXzYaw(object));
    }
  }

  private captureAllTransformLocks(): void {
    this.rotationAxisLocks.clear();
    this.positionYLocks.clear();
    this.scaleYLocks.clear();
    this.flatYawLocks.clear();
    for (const object of this.objects.values()) {
      this.captureTransformLocksForObject(object);
    }
  }

  private getRotationAxisLock(
    id: SceneObjectId,
    object: SceneObject,
  ): RotationAxisLock {
    const existing = this.rotationAxisLocks.get(id);
    if (existing !== undefined) {
      return existing;
    }

    const lock = this.rotationLockForObject(object);
    this.rotationAxisLocks.set(id, lock);
    return lock;
  }

  private getPositionYLock(id: SceneObjectId, object: SceneObject): PositionYLock {
    const existing = this.positionYLocks.get(id);
    if (existing !== undefined) {
      return existing;
    }

    const lock = this.positionYLockForObject(object);
    this.positionYLocks.set(id, lock);
    return lock;
  }

  private getScaleYLock(id: SceneObjectId, object: SceneObject): ScaleYLock {
    const existing = this.scaleYLocks.get(id);
    if (existing !== undefined) {
      return existing;
    }

    const lock = this.scaleYLockForObject(object);
    this.scaleYLocks.set(id, lock);
    return lock;
  }

  /**
   * 2D view: translate/scale on XZ (grid plane); rotate only around world Y.
   */
  private applyTransformGizmoForView(): void {
    const controls = this.transformControls;
    controls.space = "world";

    if (!this.view2D) {
      controls.showX = true;
      controls.showY = true;
      controls.showZ = true;
      return;
    }

    if (this.transformMode === "rotate") {
      controls.showX = false;
      controls.showY = true;
      controls.showZ = false;
      return;
    }

    controls.showX = true;
    controls.showY = false;
    controls.showZ = true;
  }

  private constrainSelectedObjectForView2D(): void {
    if (!this.view2D || this.selectedId === null) {
      return;
    }

    const object = this.objects.get(this.selectedId);
    if (object === undefined) {
      return;
    }

    const id = this.selectedId;

    object.position.y = this.getPositionYLock(id, object).y;
    object.scale.y = this.getScaleYLock(id, object).y;

    if (this.transformMode === "rotate") {
      if (isFlatOnXzKind(object.kind)) {
        const yaw = getFlatOnXzYaw(object);
        setFlatOnXzYaw(object, yaw);
        this.flatYawLocks.set(id, yaw);
      } else {
        const rotationLock = this.getRotationAxisLock(id, object);
        object.rotation.x = rotationLock.x;
        object.rotation.z = rotationLock.z;
      }
      return;
    }

    if (isFlatOnXzKind(object.kind)) {
      const yaw = this.flatYawLocks.get(id);
      if (yaw !== undefined) {
        setFlatOnXzYaw(object, yaw);
      }
    }
  }

  private sanitizeUpdateForView2D(
    id: SceneObjectId,
    object: SceneObject,
    update: SceneObjectUpdate,
  ): SceneObjectUpdate {
    if (!this.view2D || update.transform === undefined) {
      return update;
    }

    const { transform } = update;
    let next = transform;

    if (transform.position !== undefined) {
      next = {
        ...next,
        position: positionOnXZPlane(
          transform.position,
          this.getPositionYLock(id, object),
        ),
      };
    }

    if (transform.scale !== undefined) {
      next = {
        ...next,
        scale: scaleOnXZPlane(transform.scale, this.getScaleYLock(id, object)),
      };
    }

    if (transform.rotation !== undefined) {
      next = {
        ...next,
        rotation: rotationWithYAxisOnly(
          transform.rotation,
          this.getRotationAxisLock(id, object),
        ),
      };
    }

    if (next === transform) {
      return update;
    }

    return { ...update, transform: next };
  }

  getSnapshot(): SceneEditorSnapshot {
    return {
      objects: Array.from(this.objects.values(), (object) =>
        object.toSnapshot(),
      ),
      selectedId: this.selectedId,
      transformMode: this.transformMode,
      activeDrawTool: this.activeDrawTool,
    };
  }

  subscribe(listener: SnapshotListener): () => void {
    this.subscribers.add(listener);
    listener(this.getSnapshot());

    return () => {
      this.subscribers.delete(listener);
    };
  }

  dispose(): void {
    if (this.disposed) {
      return;
    }

    this.disposed = true;
    this.cancelDrawSession();
    this.domElement.removeEventListener("pointerdown", this.handlePointerDown);

    this.handleTransformMouseUp();
    this.transformControls.removeEventListener(
      "mouseDown",
      this.handleTransformMouseDown,
    );
    this.transformControls.removeEventListener(
      "mouseUp",
      this.handleTransformMouseUp,
    );
    this.transformControls.removeEventListener(
      "objectChange",
      this.handleTransformObjectChange,
    );

    this.transformControls.detach();
    this.scene.remove(this.transformControls.getHelper());
    this.transformControls.dispose();

    for (const object of this.objects.values()) {
      object.dispose();
    }

    this.objects.clear();
    this.selectedId = null;
    this.activeDrawTool = null;
    this.subscribers.clear();
  }

  private startDraw(event: PointerEvent): void {
    const tool = this.activeDrawTool;
    if (tool === null) {
      return;
    }

    pointerFromPointerEvent(event, this.domElement, this.pointer);
    const hit = pickPointOnSceneGridPlane(
      this.raycaster,
      this.pointer,
      this.camera,
      SCENE_GRID_PLANE_Y,
    );
    if (hit === null) {
      return;
    }

    this.drawAnchor.copy(hit);

    if (this.selectedId !== null) {
      this.transformControls.detach();
      this.selectedId = null;
    }

    if (this.restoreOrbitControls === null) {
      this.restoreOrbitControls = this.sceneControls.suspend();
    }

    const config = createDrawObjectConfig(tool, this.drawAnchor);
    const id = this.addObject(config);
    this.drawingObjectId = id;

    event.preventDefault();
    this.drawingPointerId = event.pointerId;
    this.domElement.setPointerCapture(event.pointerId);
    window.addEventListener("pointermove", this.handleDrawPointerMove);
    window.addEventListener("pointerup", this.handleDrawPointerUp);
  }

  private finishDraw(): void {
    const id = this.drawingObjectId;
    const tool = this.activeDrawTool;
    if (id === null || tool === null) {
      this.cancelDrawSession();
      return;
    }

    const object = this.objects.get(id);
    if (object !== undefined) {
      const transform = object.getTransform();
      const baked = bakeDrawFromScale(
        tool,
        transform.scale,
        transform.position,
      );
      object.applyUpdate(toBakeUpdate(baked));
    }

    this.cancelDrawSession();
    this.selectObject(id);
  }

  private cancelDrawSession(): void {
    window.removeEventListener("pointermove", this.handleDrawPointerMove);
    window.removeEventListener("pointerup", this.handleDrawPointerUp);

    if (
      this.drawingPointerId !== null &&
      this.domElement.hasPointerCapture(this.drawingPointerId)
    ) {
      this.domElement.releasePointerCapture(this.drawingPointerId);
    }
    this.drawingPointerId = null;
    this.drawingObjectId = null;

    if (this.restoreOrbitControls !== null) {
      this.restoreOrbitControls();
      this.restoreOrbitControls = null;
    }
  }

  private emitSnapshot(): void {
    if (this.disposed) {
      return;
    }

    const snapshot = this.getSnapshot();
    for (const listener of this.subscribers) {
      listener(snapshot);
    }
  }
}
