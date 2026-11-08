import type { Object3D } from "three";

export interface LoadedModel {
  object: Object3D;
  /** Frees the model's geometry, materials and textures. */
  dispose(): void;
}
