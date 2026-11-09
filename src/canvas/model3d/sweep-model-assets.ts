import type { CanvasDocument } from "../document";
import type { ElementKinds } from "../elements";
import { isModelAssetId } from "./model-asset-id";
import { isModelKind, modelAssets } from "./model-kind";

/** A 3D asset id written anywhere in stored data (`model3d:` and a UUID). */
const MODEL_ASSET_REF = /model3d:[0-9a-f-]{36}/g;

/**
 * The 3D objects' assets nothing refers to any more. Looks at every element of the document
 * (every page, not only the one on screen); copies share assets, so one stays while any copy
 * uses it. A converted model's picture can also end up in a style (an image paint) or in the
 * file's picture list, so ids those mention are kept too.
 */
export function unusedModelAssets(doc: CanvasDocument, kinds: ElementKinds): string[] {
  const used = new Set<string>();
  for (const el of doc.all()) {
    const kind = kinds.kindOf(el);
    for (const id of kind.assets(el)) used.add(id);
    if (isModelKind(kind)) for (const id of modelAssets(kind.modelData(el))) used.add(id);
  }
  for (const asset of doc.assetIndex()) used.add(asset.id);
  for (const id of JSON.stringify(doc.tokenRecords()).match(MODEL_ASSET_REF) ?? []) used.add(id);
  return doc.assetIds().filter((id) => isModelAssetId(id) && !used.has(id));
}
