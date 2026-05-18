import {
  SceneObjectKind,
  type SceneObjectSnapshot,
  type SceneObjectUpdate,
} from "../types/sceneObjects";
import {
  colorNumberToHexInput,
  hexInputToColorNumber,
} from "../utils/sceneEditorColor";

const RAD_TO_DEG = 180 / Math.PI;
const DEG_TO_RAD = Math.PI / 180;

interface SceneObjectEditorProps {
  readonly snapshot: SceneObjectSnapshot;
  readonly onUpdate: (update: SceneObjectUpdate) => void;
  /** 2D view: XZ translate/scale on grid plane, Y-axis rotation only. */
  readonly view2D?: boolean;
}

interface NumberFieldProps {
  readonly label: string;
  readonly value: number;
  readonly step?: number;
  readonly onChange: (value: number) => void;
}

function NumberField({
  label,
  value,
  step = 0.1,
  onChange,
}: NumberFieldProps): JSX.Element {
  return (
    <label className="scene-editor-field">
      <span className="scene-editor-field-label">{label}</span>
      <input
        className="scene-editor-input"
        type="number"
        step={step}
        value={Number.isFinite(value) ? value : 0}
        onChange={(event) => {
          const next = Number.parseFloat(event.target.value);
          if (!Number.isNaN(next)) {
            onChange(next);
          }
        }}
      />
    </label>
  );
}

function TransformFields({
  snapshot,
  onUpdate,
  view2D = false,
}: SceneObjectEditorProps): JSX.Element {
  const { position, rotation, scale } = snapshot.transform;

  const patchTransform = (partial: SceneObjectUpdate["transform"]): void => {
    onUpdate({ transform: partial });
  };

  const yRotationField = (
    <NumberField
      label="Y"
      step={1}
      value={rotation.y * RAD_TO_DEG}
      onChange={(deg) =>
        patchTransform({
          rotation: { ...rotation, y: deg * DEG_TO_RAD },
        })
      }
    />
  );

  return (
    <fieldset className="scene-editor-fieldset">
      <legend className="scene-editor-legend">Position</legend>
      <div className="scene-editor-field-row">
        <NumberField
          label="X"
          value={position.x}
          onChange={(x) => patchTransform({ position: { ...position, x } })}
        />
        {!view2D ? (
          <NumberField
            label="Y"
            value={position.y}
            onChange={(y) => patchTransform({ position: { ...position, y } })}
          />
        ) : null}
        <NumberField
          label="Z"
          value={position.z}
          onChange={(z) => patchTransform({ position: { ...position, z } })}
        />
      </div>
      <legend className="scene-editor-legend">Rotation (°)</legend>
      <div className="scene-editor-field-row">
        {view2D ? (
          yRotationField
        ) : (
          <>
            <NumberField
              label="X"
              step={1}
              value={rotation.x * RAD_TO_DEG}
              onChange={(deg) =>
                patchTransform({
                  rotation: { ...rotation, x: deg * DEG_TO_RAD },
                })
              }
            />
            {yRotationField}
            <NumberField
              label="Z"
              step={1}
              value={rotation.z * RAD_TO_DEG}
              onChange={(deg) =>
                patchTransform({
                  rotation: { ...rotation, z: deg * DEG_TO_RAD },
                })
              }
            />
          </>
        )}
      </div>
      <legend className="scene-editor-legend">Scale</legend>
      <div className="scene-editor-field-row">
        <NumberField
          label="X"
          value={scale.x}
          step={0.05}
          onChange={(x) => patchTransform({ scale: { ...scale, x } })}
        />
        {!view2D ? (
          <NumberField
            label="Y"
            value={scale.y}
            step={0.05}
            onChange={(y) => patchTransform({ scale: { ...scale, y } })}
          />
        ) : null}
        <NumberField
          label="Z"
          value={scale.z}
          step={0.05}
          onChange={(z) => patchTransform({ scale: { ...scale, z } })}
        />
      </div>
    </fieldset>
  );
}

function SizeFields({
  snapshot,
  onUpdate,
}: SceneObjectEditorProps): JSX.Element | null {
  switch (snapshot.kind) {
    case SceneObjectKind.Cube:
      return (
        <NumberField
          label="Edge"
          value={snapshot.size.edge}
          step={0.1}
          onChange={(edge) => onUpdate({ size: { edge } })}
        />
      );
    case SceneObjectKind.Rectangle:
      return (
        <>
          <NumberField
            label="Width"
            value={snapshot.size.width}
            step={0.1}
            onChange={(width) => onUpdate({ size: { width } })}
          />
          <NumberField
            label="Height"
            value={snapshot.size.height}
            step={0.1}
            onChange={(height) => onUpdate({ size: { height } })}
          />
        </>
      );
    case SceneObjectKind.Line:
      return (
        <>
          <NumberField
            label="Length"
            value={snapshot.size.length}
            step={0.1}
            onChange={(length) => onUpdate({ size: { length } })}
          />
          <NumberField
            label="Thickness"
            value={snapshot.size.thickness}
            step={0.01}
            onChange={(thickness) => onUpdate({ size: { thickness } })}
          />
        </>
      );
    case SceneObjectKind.Sphere:
      return (
        <NumberField
          label="Radius"
          value={snapshot.size.radius}
          step={0.1}
          onChange={(radius) => onUpdate({ size: { radius } })}
        />
      );
    case SceneObjectKind.Circle:
      return (
        <NumberField
          label="Radius"
          value={snapshot.size.radius}
          step={0.1}
          onChange={(radius) => onUpdate({ size: { radius } })}
        />
      );
    case SceneObjectKind.Ellipse:
      return (
        <>
          <NumberField
            label="Radius X"
            value={snapshot.size.radiusX}
            step={0.1}
            onChange={(radiusX) => onUpdate({ size: { radiusX } })}
          />
          <NumberField
            label="Radius Y"
            value={snapshot.size.radiusY}
            step={0.1}
            onChange={(radiusY) => onUpdate({ size: { radiusY } })}
          />
        </>
      );
    case SceneObjectKind.Point:
      return (
        <NumberField
          label="Radius"
          value={snapshot.size.radius}
          step={0.01}
          onChange={(radius) => onUpdate({ size: { radius } })}
        />
      );
    case SceneObjectKind.Polygon:
      return (
        <p className="scene-editor-note">
          Polygon vertices are fixed in this version; use transform and scale.
        </p>
      );
    default: {
      const _exhaustive: never = snapshot;
      return _exhaustive;
    }
  }
}

export default function SceneObjectConfigurator({
  snapshot,
  onUpdate,
  view2D = false,
}: SceneObjectEditorProps): JSX.Element {
  return (
    <section
      className="scene-editor-configurator"
      aria-label="Object properties"
    >
      <h2 className="scene-editor-heading">{snapshot.label}</h2>
      <p className="scene-editor-kind">{snapshot.kind}</p>

      <label className="scene-editor-field scene-editor-field-color">
        <span className="scene-editor-field-label">Color</span>
        <input
          className="scene-editor-color-input"
          type="color"
          value={colorNumberToHexInput(snapshot.color)}
          onChange={(event) =>
            onUpdate({ color: hexInputToColorNumber(event.target.value) })
          }
        />
      </label>

      <TransformFields
        snapshot={snapshot}
        onUpdate={onUpdate}
        view2D={view2D}
      />

      <fieldset className="scene-editor-fieldset">
        <legend className="scene-editor-legend">Size</legend>
        <div className="scene-editor-size-fields">
          <SizeFields snapshot={snapshot} onUpdate={onUpdate} />
        </div>
      </fieldset>
    </section>
  );
}
