import type { CanvasDocument, ModelData } from "@canvas";

/** Whether the model's own file is in this document (a copy pasted from another file has only the picture). */
export function hasModelData(doc: CanvasDocument, data: ModelData): boolean {
  return doc.getAsset(data.modelAssetId) !== undefined;
}
