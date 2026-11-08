import type { Object3D } from "three";
import type { ImportedSlot } from "@canvas";
import { BARE_SLOT, collectMaterials } from "./collect-materials";
import { externalFileOf } from "./external-texture";

/**
 * One slot per material that has a texture (the material's name), plus the single `Model` slot of
 * an OBJ with no material file. A texture inside the model is `embedded`; one that names a file
 * that was not loaded carries the file name, to be found by `resolveTextures`.
 */
export function slotsOf(object: Object3D, bareObj: boolean): ImportedSlot[] {
  const slots: ImportedSlot[] = [];
  for (const { slot, material } of collectMaterials(object, bareObj)) {
    if (slots.some((s) => s.name === slot)) continue;
    const image = (material as { map?: { image?: unknown } | null }).map?.image;
    if (image) {
      const file = externalFileOf(image);
      slots.push({ name: slot, file, embedded: file === null, data: null });
    } else if (bareObj) {
      slots.push({ name: BARE_SLOT, file: null, embedded: false, data: null });
    }
  }
  return slots;
}
