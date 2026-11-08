import type { ModelImport, ModelSource } from "./model3d.types";

/** What the viewer needs to draw an import: its bytes, the found textures and the missing slots. */
export function importedSource(imp: ModelImport): ModelSource {
  const textures = new Map<string, Uint8Array>();
  const missing: string[] = [];
  for (const slot of imp.slots) {
    if (slot.data) textures.set(slot.name, slot.data);
    else if (slot.file !== null && !slot.embedded) missing.push(slot.name);
  }
  return { model: imp.model, mtl: imp.mtl, format: imp.format, textures, missing };
}
