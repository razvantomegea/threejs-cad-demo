import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
import { Scene, WebGLRenderer, Color, REVISION } from "three";
import {
  createCamera,
  updateCameraProjection,
  resolveCameraSettings,
  type CameraProjection,
  type CameraSettings,
  type CameraSettingsInput,
} from "../helpers/camera";
import { InfiniteGridHelper } from "../helpers/InfiniteGridHelper";
import { SceneManager, type SceneObjectId } from "../helpers/SceneManager";
import { createSceneControls } from "../helpers/sceneControls";
import { DEFAULT_SCENE_GRID } from "../constants/sceneGrid";
import type { SceneControlsHandle } from "../types/sceneControls";
import type { DrawTool } from "../types/sceneDraw";
import type {
  SceneEditorSnapshot,
  SceneObjectConfig,
  SceneObjectUpdate,
  TransformMode,
} from "../types/sceneObjects";

/** Default scene background: light silver (`0xc0c0c0` / `#c0c0c0`). */
const DEFAULT_BACKGROUND_COLOR = 0xc0c0c0;

const EMPTY_EDITOR_SNAPSHOT: SceneEditorSnapshot = {
  objects: [],
  selectedId: null,
  transformMode: "translate",
  activeDrawTool: null,
};

export interface UseThreeSceneOptions extends CameraSettingsInput {
  cameraProjection?: CameraProjection;
  /** Initial enabled state; default true */
  controlsEnabled?: boolean;
  /** Hex (e.g. `0xc0c0c0`) or CSS color (e.g. `"#c0c0c0"`). Default `0xc0c0c0`. */
  backgroundColor?: number | string;
}

export interface UseThreeSceneResult {
  setControlsEnabled: (enabled: boolean) => void;
  editorSnapshot: SceneEditorSnapshot;
  addObject: (config: SceneObjectConfig) => SceneObjectId;
  updateObject: (id: SceneObjectId, update: SceneObjectUpdate) => void;
  removeObject: (id: SceneObjectId) => void;
  selectObject: (id: SceneObjectId | null) => void;
  setTransformMode: (mode: TransformMode) => void;
  setDrawTool: (tool: DrawTool | null) => void;
}

export function useThreeScene(
  containerRef: RefObject<HTMLDivElement>,
  options: UseThreeSceneOptions = {},
): UseThreeSceneResult {
  const {
    cameraProjection = "perspective",
    controlsEnabled: initialControlsEnabled = true,
    backgroundColor = DEFAULT_BACKGROUND_COLOR,
    ...cameraSettingsInput
  } = options;

  const initRef = useRef<{
    projection: CameraProjection;
    controlsEnabled: boolean;
    cameraSettings: CameraSettings;
    backgroundColor: number | string;
  } | null>(null);

  if (initRef.current === null) {
    initRef.current = {
      projection: cameraProjection,
      controlsEnabled: initialControlsEnabled,
      cameraSettings: resolveCameraSettings(cameraSettingsInput),
      backgroundColor,
    };
  }

  const controlsHandleRef = useRef<SceneControlsHandle | null>(null);
  const managerRef = useRef<SceneManager | null>(null);
  const [editorSnapshot, setEditorSnapshot] =
    useState<SceneEditorSnapshot>(EMPTY_EDITOR_SNAPSHOT);

  const setControlsEnabled = useCallback((enabled: boolean): void => {
    controlsHandleRef.current?.setEnabled(enabled);
  }, []);

  const addObject = useCallback((config: SceneObjectConfig): SceneObjectId => {
    const manager = managerRef.current;
    if (manager === null) {
      throw new Error("SceneManager is not initialized");
    }
    return manager.addObject(config);
  }, []);

  const updateObject = useCallback(
    (id: SceneObjectId, update: SceneObjectUpdate): void => {
      managerRef.current?.updateObject(id, update);
    },
    [],
  );

  const removeObject = useCallback((id: SceneObjectId): void => {
    managerRef.current?.removeObject(id);
  }, []);

  const selectObject = useCallback((id: SceneObjectId | null): void => {
    managerRef.current?.selectObject(id);
  }, []);

  const setTransformMode = useCallback((mode: TransformMode): void => {
    managerRef.current?.setTransformMode(mode);
  }, []);

  const setDrawTool = useCallback((tool: DrawTool | null): void => {
    managerRef.current?.setDrawTool(tool);
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const { projection, controlsEnabled, cameraSettings, backgroundColor } =
      initRef.current!;

    const scene = new Scene();
    scene.background = new Color(backgroundColor);

    const grid = new InfiniteGridHelper(DEFAULT_SCENE_GRID);
    scene.add(grid);

    const renderer = new WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    const camera = createCamera(container, projection, cameraSettings);
    const controls = createSceneControls(camera, renderer.domElement, {
      enabled: controlsEnabled,
    });
    controlsHandleRef.current = controls;

    const manager = new SceneManager({
      scene,
      camera,
      domElement: renderer.domElement,
      sceneControls: controls,
    });
    managerRef.current = manager;
    const unsubscribe = manager.subscribe(setEditorSnapshot);

    console.log("[boot] three.js works", { revision: REVISION });

    let frameId = 0;

    const render = (): void => {
      controls.update();
      grid.update(camera);
      renderer.render(scene, camera);
      frameId = requestAnimationFrame(render);
    };

    const handleResize = (): void => {
      updateCameraProjection(camera, container, cameraSettings);
      const h = Math.max(container.clientHeight, 1);
      renderer.setSize(container.clientWidth, h);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);
    handleResize();
    render();

    return () => {
      cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      unsubscribe();
      grid.dispose();
      scene.remove(grid);
      manager.dispose();
      managerRef.current = null;
      setEditorSnapshot(EMPTY_EDITOR_SNAPSHOT);
      controls.dispose();
      controlsHandleRef.current = null;
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [containerRef]);

  return {
    setControlsEnabled,
    editorSnapshot,
    addObject,
    updateObject,
    removeObject,
    selectObject,
    setTransformMode,
    setDrawTool,
  };
}
