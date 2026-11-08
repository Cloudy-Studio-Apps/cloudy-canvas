import type { Object3D } from "three";
import type { ImportedSlot } from "@canvas";
import { collectMaterials, GLTF_INDEX } from "./collect-materials";
import { externalFileOf } from "./external-texture";
import type { GltfMissing } from "./gltf-files.types";

/**
 * One slot per distinct material (its name), or the single `Model` slot of an OBJ with no
 * material file. A texture inside the model is `embedded`; one that names a file that was not
 * loaded carries the file name, to be found by `resolveTextures`; a material with no texture is
 * untextured (`file: null`, not embedded) and keeps its own look.
 */
export function slotsOf(
  object: Object3D,
  bareObj: boolean,
  gltfMissing: ReadonlyMap<number, GltfMissing> = new Map(),
): ImportedSlot[] {
  const slots: ImportedSlot[] = [];
  for (const { slot, material } of collectMaterials(object, bareObj)) {
    if (slots.some((s) => s.name === slot)) continue;
    const missing = gltfMissing.get(material.userData[GLTF_INDEX] as number);
    const image = (material as { map?: { image?: unknown } | null }).map?.image;
    if (missing) {
      slots.push({ name: slot, file: missing.file, embedded: false, data: null });
    } else if (image) {
      const file = externalFileOf(image);
      slots.push({ name: slot, file, embedded: file === null, data: null });
    } else {
      slots.push({ name: slot, file: null, embedded: false, data: null });
    }
  }
  return slots;
}
