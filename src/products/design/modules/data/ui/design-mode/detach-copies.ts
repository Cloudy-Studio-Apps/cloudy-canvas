import type { CanvasDocument, CanvasElement } from "@canvas";

import { dataCopyTag, detachDataCopy } from "../../repeat";

/** Detaches the copies the layers belong to (one per row), as one undo step. */
export function detachCopies(doc: CanvasDocument, nodes: readonly CanvasElement[]): void {
  const rows = new Set<string>();
  const ids: string[] = [];
  for (const node of nodes) {
    const tag = dataCopyTag(node);
    if (!tag) continue;
    const row = JSON.stringify([tag.iterator, tag.key]);
    if (rows.has(row)) continue;
    rows.add(row);
    ids.push(node.id);
  }
  const release = doc.holdCheckpoints();
  try {
    for (const id of ids) detachDataCopy(doc, id);
  } finally {
    release();
  }
}
