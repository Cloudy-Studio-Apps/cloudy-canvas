import type { CanvasDocument } from "@canvas";

import { isDataSource } from "../source";

/**
 * Removes the picture assets an Update added (`added`'s assets that `known`, the record's images
 * when it started, didn't have) when it fails after saving them, so a failed Update leaves none
 * pointed at by nothing. An asset the record points at now (a peer's or undo's) is kept.
 */
export function removeAddedPictures(
  doc: CanvasDocument,
  id: string,
  known: Record<string, string>,
  added: Record<string, string>,
): void {
  const kept = new Set(Object.values(known));
  const el = doc.get(id);
  if (el && isDataSource(el)) for (const asset of Object.values(el.images ?? {})) kept.add(asset);
  const gone = [...new Set(Object.values(added))].filter(
    (asset) => !kept.has(asset) && doc.hasAsset(asset),
  );
  if (gone.length > 0) doc.removeAssets(gone);
}
