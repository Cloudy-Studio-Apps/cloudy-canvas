import type { Material, Mesh, Object3D, Texture } from "three";

/** Frees a material and the textures it holds. */
export function disposeMaterial(material: Material): void {
  for (const value of Object.values(material)) {
    if (value && (value as { isTexture?: boolean }).isTexture) (value as Texture).dispose();
  }
  material.dispose();
}

/** Frees the GPU-side data of everything under the object. */
export function disposeObject(object: Object3D): void {
  object.traverse((child) => {
    const mesh = child as Mesh;
    mesh.geometry?.dispose();
    const material = mesh.material as Material | Material[] | undefined;
    if (!material) return;
    for (const item of Array.isArray(material) ? material : [material]) disposeMaterial(item);
  });
}
