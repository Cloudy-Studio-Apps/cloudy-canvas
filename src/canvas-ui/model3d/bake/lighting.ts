import type { PerspectiveCamera, Scene } from "three";
import type { ThreeKit } from "../load";

/** The fixed lights every model is shown with, so the picture matches the live view. */
export const LIGHTING = {
  skyColor: 0xffffff,
  groundColor: 0x8a8a96,
  hemisphereIntensity: 1.1,
  keyColor: 0xffffff,
  keyIntensity: 2.2,
  /** In the camera's space: up, left and toward the viewer. */
  keyPosition: [-4, 5, 6],
} as const;

/**
 * Adds one hemisphere light and one directional key light from the camera's upper left. The key
 * light (and its target) belong to the camera, so the light follows the framing. The camera is
 * added to the scene too.
 */
export function addLighting(kit: ThreeKit, scene: Scene, camera: PerspectiveCamera): void {
  const { THREE } = kit;
  const hemisphere = new THREE.HemisphereLight(
    LIGHTING.skyColor,
    LIGHTING.groundColor,
    LIGHTING.hemisphereIntensity,
  );
  const key = new THREE.DirectionalLight(LIGHTING.keyColor, LIGHTING.keyIntensity);
  key.position.set(...LIGHTING.keyPosition);
  key.target.position.set(0, 0, -1);
  camera.add(key, key.target);
  scene.add(hemisphere, camera);
}
