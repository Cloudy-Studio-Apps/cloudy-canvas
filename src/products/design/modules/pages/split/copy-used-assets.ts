import type { CanvasDocument } from "@canvas";

/**
 * Copies into `target` the bytes, and the file's picture records, of every asset of `source` that
 * `target`'s elements or variables and styles use.
 */
export function copyUsedAssets(source: CanvasDocument, target: CanvasDocument): void {
  // shortcut: finds uses by searching the data for the id, upgrade if an asset id can appear without being a use
  const text = JSON.stringify(target.all()) + JSON.stringify(target.tokenRecords());
  const used = new Set(source.assetIds().filter((id) => text.includes(id)));
  for (const id of used) {
    const bytes = source.getAsset(id);
    if (bytes) target.addAsset(id, bytes);
  }
  for (const asset of source.assetIndex()) if (used.has(asset.id)) target.setAssetIndexEntry(asset);
}
