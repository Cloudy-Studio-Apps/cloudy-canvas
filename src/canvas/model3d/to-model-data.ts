import { DEFAULT_MODEL_VIEW } from "./model3d.constants";
import type { ModelData, ModelImport } from "./model3d.types";
import type { ModelAssetIds } from "./to-model-data.types";

/**
 * The data a model element holds for a fresh import, shown from the default view. A slot keeps its
 * `file` and `embedded` flag and points at its stored picture (`null` when none was found).
 */
export function toModelData(imp: ModelImport, ids: ModelAssetIds): ModelData {
  return {
    modelAssetId: ids.model,
    mtlAssetId: ids.mtl,
    format: imp.format,
    fileName: imp.fileName,
    fileSize: imp.totalBytes,
    pictureAssetId: ids.picture,
    angle: { ...DEFAULT_MODEL_VIEW.angle },
    zoom: DEFAULT_MODEL_VIEW.zoom,
    textures: imp.slots.map((slot, i) => ({
      name: slot.name,
      file: slot.file,
      assetId: ids.textures[i] ?? null,
      embedded: slot.embedded,
    })),
  };
}
