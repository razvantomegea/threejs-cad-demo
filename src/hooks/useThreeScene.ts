import { useEffect, type RefObject } from "react";
import {
  Scene,
  PerspectiveCamera,
  WebGLRenderer,
  Color,
  REVISION,
} from "three";

export function useThreeScene(containerRef: RefObject<HTMLDivElement>): void {
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new Scene();
    scene.background = new Color(0x101014);

    const camera = new PerspectiveCamera(
      60,
      container.clientWidth / Math.max(container.clientHeight, 1),
      0.1,
      100
    );
    camera.position.z = 5;

    const renderer = new WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    console.log("[boot] three.js works", { revision: REVISION });

    let frameId = 0;
    const tick = (): void => {
      renderer.render(scene, camera);
      frameId = requestAnimationFrame(tick);
    };
    tick();

    const handleResize = (): void => {
      const w = container.clientWidth;
      const h = Math.max(container.clientHeight, 1);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [containerRef]);
}
