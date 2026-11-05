import type { CanvasDocument } from "@canvas";

import { dataSourcesIn } from "../source";
import { heldSnapshots } from "./held-snapshots";

/**
 * How every snapshot asset starts (`encodeRows`: `{ version: 1, rows }` or, with the rows before
 * a shape step, `{ version: 2, raw, rows }`, as JSON in UTF-8).
 */
const SNAPSHOT_STARTS = ['{"version":1,"rows":', '{"version":2,"raw":'].map((text) =>
  new TextEncoder().encode(text),
);

function isSnapshot(bytes: Uint8Array): boolean {
  return SNAPSHOT_STARTS.some(
    (start) => bytes.length >= start.length && start.every((byte, i) => bytes[i] === byte),
  );
}

/**
 * Deletes the data snapshots no source points at any more (each Update of changed data saves a
 * new one), so they don't pile up in the file: each source keeps its latest and the one it
 * replaced (`DataSnapshot.previous`). Run when the file is
 * saved. The ones undo could bring back while the file is open (`heldSnapshots`: pointed at since
 * it opened) stay until a later session saves it. Returns how many went.
 */
export function pruneSnapshots(doc: CanvasDocument): number {
  const kept = new Set(heldSnapshots(doc));
  for (const source of dataSourcesIn(doc)) {
    if (source.snapshot) kept.add(source.snapshot.assetId);
    // The one before it too: undoing the last Update (a peer's as well) points back at it.
    if (source.snapshot?.previous) kept.add(source.snapshot.previous);
  }
  const gone = doc.assetIds().filter((id) => {
    if (kept.has(id)) return false;
    const bytes = doc.getAsset(id);
    return bytes !== undefined && isSnapshot(bytes);
  });
  if (gone.length > 0) doc.removeAssets(gone);
  return gone.length;
}
