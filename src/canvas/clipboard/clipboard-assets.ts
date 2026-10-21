import type { CanvasDocument } from "../document";
import type { CanvasElement, ElementKinds } from "../elements";
import { base64ToBytes, bytesToBase64 } from "../utils";

/** The assets the elements show, base64 by id, for the clipboard. */
export function collectAssets(
  doc: CanvasDocument,
  kinds: ElementKinds,
  elements: readonly CanvasElement[],
): Record<string, string> {
  const assets: Record<string, string> = {};
  for (const el of elements) {
    for (const id of kinds.kindOf(el).assets(el)) {
      const data = id in assets ? undefined : doc.getAsset(id);
      if (data) assets[id] = bytesToBase64(data);
    }
  }
  return assets;
}

/** Adds the clipboard's assets the document doesn't have yet (pasting into another file). */
export function restoreAssets(doc: CanvasDocument, assets: Record<string, string>): void {
  for (const [id, base64] of Object.entries(assets)) {
    if (doc.hasAsset(id)) continue;
    try {
      doc.addAsset(id, base64ToBytes(base64));
    } catch {
      console.warn("[clipboard] Skipped an asset that isn't base64:", id);
    }
  }
}
