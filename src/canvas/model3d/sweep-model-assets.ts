import type { CanvasDocument } from "../document";
import type { ElementKinds } from "../elements";
import { isModelAssetId } from "./model-asset-id";
import { isModelKind, modelAssets } from "./model-kind";

/**
 * The 3D objects' assets no element refers to any more. Looks at every element of the document
 * (every page, not only the one on screen); copies share assets, so one stays while any copy
 * uses it.
 */
export function unusedModelAssets(doc: CanvasDocument, kinds: ElementKinds): string[] {
  const used = new Set<string>();
  for (const el of doc.all()) {
    const kind = kinds.kindOf(el);
    for (const id of kind.assets(el)) used.add(id);
    if (isModelKind(kind)) for (const id of modelAssets(kind.modelData(el))) used.add(id);
  }
  return doc.assetIds().filter((id) => isModelAssetId(id) && !used.has(id));
}
