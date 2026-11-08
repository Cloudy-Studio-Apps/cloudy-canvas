import type { Material, Mesh, Object3D } from "three";
import type { MaterialRef } from "./collect-materials.types";

/** The slot name of an OBJ that has no material file. */
export const BARE_SLOT = "Model";

/**
 * Each distinct material of the object with the name its texture slot has: the material's own name
 * (`Material N` when it has none), or `Model` for every material of an OBJ with no `.mtl`.
 */
export function collectMaterials(object: Object3D, bareObj: boolean): MaterialRef[] {
  const seen = new Set<Material>();
  const refs: MaterialRef[] = [];
  object.traverse((child) => {
    const material = (child as Mesh).material as Material | Material[] | undefined;
    if (!material) return;
    for (const item of Array.isArray(material) ? material : [material]) {
      if (seen.has(item)) continue;
      seen.add(item);
      refs.push({
        slot: bareObj ? BARE_SLOT : item.name || `Material ${refs.length + 1}`,
        material: item,
      });
    }
  });
  return refs;
}
