import { useRef } from "react";
import { useThreeScene } from "../hooks/useThreeScene";

export default function Scene(): JSX.Element {
  const containerRef = useRef<HTMLDivElement>(null);
  useThreeScene(containerRef);
  return <div ref={containerRef} className="scene-root" />;
}
