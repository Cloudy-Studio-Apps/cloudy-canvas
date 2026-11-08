import type { Mesh, Object3D, PerspectiveCamera, Vector3 } from "three";
import type { ModelFrame, ModelView } from "./frame-model.types";

/** The vertical field of view models are framed with, in degrees. */
export const FRAME_FOV = 35;

/** What a model's width over height may be, so a thin model still gets a usable picture. */
export const ASPECT_RANGE = { min: 0.25, max: 4 } as const;

/**
 * Frames the model: its bounding sphere fills the camera's view at zoom 1 (zoom divides the
 * distance), the camera looks at the bounding box's center along -Z, and the view's angle (Euler
 * XYZ, degrees) turns the model around that center. Resets and then sets the object's own
 * position and rotation, so calling it again with another view is fine. Returns the projected
 * bounds' aspect. Set `camera.aspect` first. Throws when the model has no geometry.
 */
export function frameModel(
  object: Object3D,
  camera: PerspectiveCamera,
  view: ModelView,
): ModelFrame {
  const scratch = camera.position.clone();
  object.position.set(0, 0, 0);
  object.rotation.set(0, 0, 0);
  object.updateMatrixWorld(true);
  const base = worldCorners(object, scratch);
  if (base.length === 0) throw new Error("The model has no geometry to show");

  const { center, radius } = sphereOf(base, scratch);
  const rad = Math.PI / 180;
  object.rotation.set(view.angle.x * rad, view.angle.y * rad, view.angle.z * rad, "XYZ");
  object.position.copy(center).sub(center.clone().applyEuler(object.rotation));
  object.updateMatrixWorld(true);

  camera.fov = FRAME_FOV;
  const half = Math.atan(Math.tan((FRAME_FOV * rad) / 2) * Math.min(1, camera.aspect));
  const distance = radius / Math.sin(half) / Math.max(view.zoom, 1e-6);
  camera.near = Math.max(distance - radius * 1.5, distance * 0.01, 1e-4);
  camera.far = distance + radius * 3;
  camera.position.set(center.x, center.y, center.z + distance);
  camera.lookAt(center);
  camera.updateProjectionMatrix();
  camera.updateMatrixWorld(true);

  return { aspect: projectedAspect(worldCorners(object, scratch), camera) };
}

function sphereOf(points: readonly Vector3[], scratch: Vector3) {
  const min = scratch.clone().set(Infinity, Infinity, Infinity);
  const max = scratch.clone().set(-Infinity, -Infinity, -Infinity);
  for (const p of points) {
    min.min(p);
    max.max(p);
  }
  const center = min.clone().add(max).multiplyScalar(0.5);
  let radius = 0;
  for (const p of points) radius = Math.max(radius, p.distanceTo(center));
  return { center, radius: radius || 1 };
}

function projectedAspect(points: readonly Vector3[], camera: PerspectiveCamera): number {
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  for (const p of points) {
    p.project(camera);
    minX = Math.min(minX, p.x);
    maxX = Math.max(maxX, p.x);
    minY = Math.min(minY, p.y);
    maxY = Math.max(maxY, p.y);
  }
  const ratio = ((maxX - minX) * camera.aspect) / Math.max(maxY - minY, 1e-9);
  return Math.min(ASPECT_RANGE.max, Math.max(ASPECT_RANGE.min, ratio || 1));
}

/** The eight corners of every mesh's bounding box, in world space. */
function worldCorners(object: Object3D, scratch: Vector3): Vector3[] {
  const corners: Vector3[] = [];
  object.traverse((child) => {
    const mesh = child as Mesh;
    const geometry = mesh.geometry;
    if (!geometry) return;
    if (!geometry.boundingBox) geometry.computeBoundingBox();
    const box = geometry.boundingBox;
    if (!box || box.isEmpty()) return;
    for (const x of [box.min.x, box.max.x])
      for (const y of [box.min.y, box.max.y])
        for (const z of [box.min.z, box.max.z])
          corners.push(scratch.clone().set(x, y, z).applyMatrix4(mesh.matrixWorld));
  });
  return corners;
}
