import { useEffect, useRef, useState } from "react";
import { useThreeScene } from "../hooks/useThreeScene";

export default function Scene(): JSX.Element {
  const containerRef = useRef<HTMLDivElement>(null);
  const [controlsEnabled, setControlsEnabledState] = useState(true);

  const { setControlsEnabled } = useThreeScene(containerRef);

  useEffect(() => {
    setControlsEnabled(controlsEnabled);
  }, [controlsEnabled, setControlsEnabled]);

  return (
    <>
      <div className="scene-controls-panel">
        <label className="scene-controls-label">
          <input
            type="checkbox"
            checked={controlsEnabled}
            onChange={(e) => setControlsEnabledState(e.target.checked)}
          />
          Orbit controls
        </label>
        <p className="scene-controls-hint">
          Left drag: rotate · Right drag: pan · Wheel: zoom
        </p>
      </div>
      <div ref={containerRef} className="scene-root" />
    </>
  );
}
