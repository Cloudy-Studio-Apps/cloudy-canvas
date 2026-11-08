import type { CanvasDocument } from "../document";
import type { ModelData, ModelSource } from "./model3d.types";

/**
 * What the viewer needs to draw a stored model, read from the document: its bytes, the picture of
 * every slot whose asset is there and the slots whose named file was never found. `null` when the
 * model's own asset isn't in this document.
 */
export function modelSource(doc: CanvasDocument, data: ModelData): ModelSource | null {
  const model = doc.getAsset(data.modelAssetId);
  if (!model) return null;
  const textures = new Map<string, Uint8Array>();
  const missing: string[] = [];
  for (const slot of data.textures) {
    const bytes = slot.assetId ? doc.getAsset(slot.assetId) : undefined;
    if (bytes) textures.set(slot.name, bytes);
    else if (slot.file !== null && slot.assetId === null && !slot.embedded) missing.push(slot.name);
  }
  const mtl = data.mtlAssetId ? (doc.getAsset(data.mtlAssetId) ?? null) : null;
  return { model, mtl, format: data.format, textures, missing };
}
