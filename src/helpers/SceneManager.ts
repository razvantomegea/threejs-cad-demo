import {
  type Camera,
  Raycaster,
  type Scene,
  Vector2,
} from "three";
import { TransformControls } from "three/addons/controls/TransformControls.js";
import createSceneObject from "../sceneObjects/createSceneObject.ts";
import SceneObject from "../sceneObjects/SceneObject.ts";
import type { SceneControlsHandle } from "../types/sceneControls.ts";
import type {
  SceneEditorSnapshot,
  SceneObjectConfig,
  SceneObjectUpdate,
  TransformMode,
} from "../types/sceneObjects.ts";

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
  private readonly camera: Camera;
  private readonly domElement: HTMLElement;
  private readonly sceneControls: SceneControlsHandle;
  private readonly objects = new Map<SceneObjectId, SceneObject>();
  private readonly subscribers = new Set<SnapshotListener>();
  private readonly raycaster = new Raycaster();
  private readonly pointer = new Vector2();
  private readonly transformControls: TransformControls;

  private selectedId: SceneObjectId | null = null;
  private transformMode: TransformMode = DEFAULT_TRANSFORM_MODE;
  private restoreOrbitControls: (() => void) | null = null;
  private disposed = false;

  private readonly handlePointerDown = (event: PointerEvent): void => {
    if (this.disposed || event.button !== 0 || this.transformControls.dragging) {
      return;
    }

    const rect = this.domElement.getBoundingClientRect();
    const width = rect.width || 1;
    const height = rect.height || 1;

    this.pointer.x = ((event.clientX - rect.left) / width) * 2 - 1;
    this.pointer.y = -((event.clientY - rect.top) / height) * 2 + 1;

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

    domElement.addEventListener("pointerdown", this.handlePointerDown);
  }

  addObject(config: SceneObjectConfig): SceneObjectId {
    const object = createSceneObject(config);
    this.objects.set(object.id, object);
    this.scene.add(object);
    this.emitSnapshot();
    return object.id;
  }

  updateObject(id: SceneObjectId, update: SceneObjectUpdate): void {
    const object = this.objects.get(id);
    if (object === undefined) {
      return;
    }

    object.applyUpdate(update);
    this.emitSnapshot();
  }

  removeObject(id: SceneObjectId): void {
    const object = this.objects.get(id);
    if (object === undefined) {
      return;
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
    this.emitSnapshot();
  }

  getSnapshot(): SceneEditorSnapshot {
    return {
      objects: Array.from(this.objects.values(), (object) => object.toSnapshot()),
      selectedId: this.selectedId,
      transformMode: this.transformMode,
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
    this.subscribers.clear();
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
