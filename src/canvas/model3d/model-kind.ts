import type { ModelData, ModelKind } from "./model3d.types";

/** Whether an element kind holds a 3D model. */
export function isModelKind(kind: unknown): kind is ModelKind {
  return (
    typeof kind === "object" &&
    kind !== null &&
    typeof (kind as { modelData?: unknown }).modelData === "function"
  );
}

/** The ids of every asset a model holds: the model, its material, its picture and its textures. */
export function modelAssets(data: ModelData): string[] {
  const ids = [data.modelAssetId, data.pictureAssetId];
  if (data.mtlAssetId) ids.push(data.mtlAssetId);
  for (const slot of data.textures) if (slot.assetId) ids.push(slot.assetId);
  return ids;
}
