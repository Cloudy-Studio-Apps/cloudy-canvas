import type { CanvasDocument } from "@canvas";

import { layoutOf } from "../../core";
import type { FrameElement } from "../../frame";
import { detachedRowsGone } from "../repeat/detach-data-copy";
import type { DataScopes } from "../repeat/data-scopes.types";
import { sourceOf } from "./source-of";
import type { IssueSink } from "./sink";

/** Copies beyond this (a `designLimit` set that high) make the document heavy. */
export const MANY_COPIES = 500;

/** What is wrong with one iterator: too many copies, copies stacked, detached rows gone. */
export function iteratorIssues(
  doc: CanvasDocument,
  frame: FrameElement,
  scopes: DataScopes,
  sink: IssueSink,
): void {
  const it = scopes.iterator(frame);
  if (!it) return;
  const nodeId = frame.id;
  const sourceId = sourceOf(it.scope, it.repeat.source);
  const { repeat, rows } = it;
  if (rows.rows.length > MANY_COPIES) {
    sink.add({ kind: "too-many-copies", nodeId, sourceId, detail: String(rows.rows.length) });
  }
  if (rows.rows.length > 1 && !layoutOf(frame)) {
    sink.add({ kind: "copies-stacked", nodeId, sourceId, detail: String(rows.rows.length) });
  }
  if (repeat.detached.length > 0) {
    const gone = detachedRowsGone(doc, nodeId, it.scope);
    if (gone.length > 0) {
      sink.add({ kind: "detached-row-gone", nodeId, sourceId, detail: gone.join(", ") });
    }
  }
}
