import { useEffect, type RefObject } from "react";
import { Scene, WebGLRenderer, Color, REVISION } from "three";
import { useCamera, updateCameraProjection } from "./useCamera";

export function useThreeScene(containerRef: RefObject<HTMLDivElement>): void {
  const cameraRef = useCamera(containerRef);

  useEffect(() => {
    const container = containerRef.current;
    const camera = cameraRef.current;
    if (!container || !camera) return;

    const scene = new Scene();
    scene.background = new Color(0x101014);

    const renderer = new WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    console.log("[boot] three.js works", { revision: REVISION });

    let frameId = 0;

    const render = (): void => {
      renderer.render(scene, camera);
      frameId = requestAnimationFrame(render);
    };

    render();

    const handleResize = (): void => {
      updateCameraProjection(camera, container);
      const h = Math.max(container.clientHeight, 1);
      renderer.setSize(container.clientWidth, h);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [containerRef, cameraRef]);
}
