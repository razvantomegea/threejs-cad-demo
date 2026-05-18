import { type Camera, Plane, Raycaster, Vector2, Vector3 } from "three";

const GRID_PLANE_NORMAL = new Vector3(0, 1, 0);
const INTERSECTION_TARGET = new Vector3();

export function pointerFromPointerEvent(
  event: PointerEvent,
  domElement: HTMLElement,
  pointer: Vector2,
): void {
  const rect = domElement.getBoundingClientRect();
  const width = rect.width || 1;
  const height = rect.height || 1;

  pointer.x = ((event.clientX - rect.left) / width) * 2 - 1;
  pointer.y = -((event.clientY - rect.top) / height) * 2 + 1;
}

export function pickPointOnSceneGridPlane(
  raycaster: Raycaster,
  pointer: Vector2,
  camera: Camera,
  planeY: number,
): Vector3 | null {
  raycaster.setFromCamera(pointer, camera);

  const plane = new Plane(GRID_PLANE_NORMAL, -planeY);
  const hit = raycaster.ray.intersectPlane(plane, INTERSECTION_TARGET);

  if (hit === null) {
    return null;
  }

  return hit.clone();
}
