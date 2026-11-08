import type { CanvasDocument } from "../document";
import type { Rect } from "../geometry.types";
import { importedSource } from "./imported-source";
import { newModelAssetId } from "./model-asset-id";
import { DEFAULT_MODEL_VIEW } from "./model3d.constants";
import type { ModelBaker, ModelData, ModelImport } from "./model3d.types";
import { toModelData } from "./to-model-data";

/**
 * Stores an import in the document: bakes its first picture at `rect`'s size, then adds the
 * model, its material file, the textures found and the picture as assets (`newModelAssetId()`).
 * Returns the data for the product's element. Assets are outside undo, as when pasting.
 */
export async function storeModel(
  baker: ModelBaker,
  imp: ModelImport,
  rect: Rect,
  doc: CanvasDocument,
): Promise<ModelData> {
  const picture = await baker.bake(importedSource(imp), DEFAULT_MODEL_VIEW, rect);
  const ids = {
    model: newModelAssetId(),
    mtl: imp.mtl ? newModelAssetId() : null,
    picture: newModelAssetId(),
    textures: imp.slots.map((slot) => (slot.data ? newModelAssetId() : null)),
  };
  doc.addAsset(ids.model, imp.model);
  if (imp.mtl && ids.mtl) doc.addAsset(ids.mtl, imp.mtl);
  doc.addAsset(ids.picture, picture);
  imp.slots.forEach((slot, i) => {
    const id = ids.textures[i];
    if (slot.data && id) doc.addAsset(id, slot.data);
  });
  return toModelData(imp, ids);
}
