import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useThreeScene } from "../hooks/useThreeScene";
import type { DrawTool } from "../types/sceneDraw";
import {
  SceneObjectKind,
  type SceneObjectConfig,
  type TransformMode,
} from "../types/sceneObjects";
import SceneObjectConfigurator from "./SceneObjectConfigurator";

const ADD_SHAPE_OPTIONS: readonly { kind: SceneObjectKind; label: string }[] = [
  { kind: SceneObjectKind.Cube, label: "Cube" },
  { kind: SceneObjectKind.Rectangle, label: "Rect" },
  { kind: SceneObjectKind.Line, label: "Line" },
  { kind: SceneObjectKind.Sphere, label: "Sphere" },
  { kind: SceneObjectKind.Circle, label: "Circle" },
  { kind: SceneObjectKind.Ellipse, label: "Ellipse" },
  { kind: SceneObjectKind.Point, label: "Point" },
  { kind: SceneObjectKind.Polygon, label: "Polygon" },
];

const DRAW_TOOL_OPTIONS: readonly { kind: DrawTool; label: string }[] = [
  { kind: SceneObjectKind.Rectangle, label: "Draw rect" },
  { kind: SceneObjectKind.Ellipse, label: "Draw ellipse" },
];

const TRANSFORM_MODES: readonly { mode: TransformMode; label: string }[] = [
  { mode: "translate", label: "Move" },
  { mode: "rotate", label: "Rotate" },
  { mode: "scale", label: "Scale" },
];

export default function Scene(): JSX.Element {
  const containerRef = useRef<HTMLDivElement>(null);
  const [controlsEnabled, setControlsEnabledState] = useState(true);

  const {
    setControlsEnabled,
    editorSnapshot,
    addObject,
    updateObject,
    removeObject,
    selectObject,
    setTransformMode,
    setDrawTool,
  } = useThreeScene(containerRef);

  useEffect(() => {
    setControlsEnabled(controlsEnabled);
  }, [controlsEnabled, setControlsEnabled]);

  const selectedSnapshot = useMemo(
    () =>
      editorSnapshot.objects.find(
        (object) => object.id === editorSnapshot.selectedId,
      ) ?? null,
    [editorSnapshot.objects, editorSnapshot.selectedId],
  );

  const handleAddShape = useCallback(
    (kind: SceneObjectKind): void => {
      const config = { kind } as SceneObjectConfig;
      const id = addObject(config);
      selectObject(id);
    },
    [addObject, selectObject],
  );

  const handleDeleteSelected = useCallback((): void => {
    if (editorSnapshot.selectedId === null) {
      return;
    }
    removeObject(editorSnapshot.selectedId);
  }, [editorSnapshot.selectedId, removeObject]);

  const handleDrawToolClick = useCallback(
    (kind: DrawTool): void => {
      setDrawTool(editorSnapshot.activeDrawTool === kind ? null : kind);
    },
    [editorSnapshot.activeDrawTool, setDrawTool],
  );

  const handleSelectedUpdate = useCallback(
    (update: Parameters<typeof updateObject>[1]): void => {
      if (editorSnapshot.selectedId === null) {
        return;
      }
      updateObject(editorSnapshot.selectedId, update);
    },
    [editorSnapshot.selectedId, updateObject],
  );

  return (
    <>
      <aside className="scene-editor-panel" aria-label="Scene editor">
        <section className="scene-editor-section">
          <label className="scene-controls-label">
            <input
              type="checkbox"
              checked={controlsEnabled}
              onChange={(event) => setControlsEnabledState(event.target.checked)}
            />
            Orbit controls
          </label>
          <p className="scene-controls-hint">
            Left drag: rotate · Right drag: pan · Wheel: zoom
          </p>
        </section>

        <section className="scene-editor-section">
          <h2 className="scene-editor-heading">Gizmo</h2>
          <div
            className="scene-editor-button-group"
            role="group"
            aria-label="Transform mode"
          >
            {TRANSFORM_MODES.map(({ mode, label }) => (
              <button
                key={mode}
                type="button"
                className={
                  editorSnapshot.transformMode === mode
                    ? "scene-editor-button scene-editor-button-active"
                    : "scene-editor-button"
                }
                aria-pressed={editorSnapshot.transformMode === mode}
                onClick={() => setTransformMode(mode)}
              >
                {label}
              </button>
            ))}
          </div>
        </section>

        <section className="scene-editor-section">
          <h2 className="scene-editor-heading">Draw</h2>
          <div
            className="scene-editor-button-group"
            role="group"
            aria-label="Draw tools"
          >
            {DRAW_TOOL_OPTIONS.map(({ kind, label }) => (
              <button
                key={kind}
                type="button"
                className={
                  editorSnapshot.activeDrawTool === kind
                    ? "scene-editor-button scene-editor-button-active"
                    : "scene-editor-button"
                }
                aria-pressed={editorSnapshot.activeDrawTool === kind}
                onClick={() => handleDrawToolClick(kind)}
              >
                {label}
              </button>
            ))}
          </div>
          {editorSnapshot.activeDrawTool !== null ? (
            <p className="scene-controls-hint">
              Click and drag on the grid to draw. Release to finish.
            </p>
          ) : null}
        </section>

        <section className="scene-editor-section">
          <h2 className="scene-editor-heading">Add shape</h2>
          <div className="scene-editor-add-grid">
            {ADD_SHAPE_OPTIONS.map(({ kind, label }) => (
              <button
                key={kind}
                type="button"
                className="scene-editor-button"
                onClick={() => handleAddShape(kind)}
              >
                {label}
              </button>
            ))}
          </div>
        </section>

        <section className="scene-editor-section">
          <div className="scene-editor-section-header">
            <h2 className="scene-editor-heading">Objects</h2>
            <button
              type="button"
              className="scene-editor-button scene-editor-button-danger"
              disabled={editorSnapshot.selectedId === null}
              onClick={handleDeleteSelected}
            >
              Delete
            </button>
          </div>
          {editorSnapshot.objects.length === 0 ? (
            <p className="scene-editor-empty">No objects yet.</p>
          ) : (
            <ul className="scene-editor-object-list">
              {editorSnapshot.objects.map((object) => (
                <li key={object.id}>
                  <button
                    type="button"
                    className={
                      object.id === editorSnapshot.selectedId
                        ? "scene-editor-object-item scene-editor-object-item-selected"
                        : "scene-editor-object-item"
                    }
                    aria-current={
                      object.id === editorSnapshot.selectedId
                        ? "true"
                        : undefined
                    }
                    onClick={() => selectObject(object.id)}
                  >
                    <span className="scene-editor-object-label">
                      {object.label}
                    </span>
                    <span className="scene-editor-object-kind">
                      {object.kind}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        {selectedSnapshot !== null ? (
          <SceneObjectConfigurator
            snapshot={selectedSnapshot}
            onUpdate={handleSelectedUpdate}
          />
        ) : (
          <p className="scene-editor-empty scene-editor-empty-select">
            Select an object to edit properties.
          </p>
        )}
      </aside>
      <div
        ref={containerRef}
        className={
          editorSnapshot.activeDrawTool !== null
            ? "scene-root scene-root-draw"
            : "scene-root"
        }
      />
    </>
  );
}
