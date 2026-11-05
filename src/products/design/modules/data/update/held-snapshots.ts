import type { CanvasDocument } from "@canvas";

import { dataSourcesIn } from "../source";

/** By Yjs doc: the snapshot assets this device has seen sources point at while it's open. */
const HELD = new WeakMap<object, Set<string>>();

/**
 * The snapshots undo could bring back while the document is open: every one a source pointed at
 * when it was first looked at (the editor opening it) and every one saved since. Pruning keeps
 * them; the next session drops the ones nothing points at.
 */
export function heldSnapshots(doc: CanvasDocument): Set<string> {
  let held = HELD.get(doc.doc);
  if (!held) {
    held = new Set();
    for (const source of dataSourcesIn(doc)) {
      if (source.snapshot) held.add(source.snapshot.assetId);
    }
    HELD.set(doc.doc, held);
  }
  return held;
}
