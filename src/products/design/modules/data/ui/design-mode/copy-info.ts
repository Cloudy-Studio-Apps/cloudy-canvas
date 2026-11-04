import type { CanvasDocument, CanvasElement } from "@canvas";

import { dataCopyTag, detachBlocker, repeatOf, repeatRows, scopeAt } from "../../repeat";
import type { CopyInfo } from "./copy-info.types";

/** Where a copy (a copy's root or a layer in it) comes from; `null` for any other layer. */
export function copyInfo(doc: CanvasDocument, node: CanvasElement): CopyInfo | null {
  const tag = dataCopyTag(node);
  if (!tag) return null;
  const frame = doc.get(tag.iterator);
  const repeat = frame ? repeatOf(frame) : null;
  const row =
    frame && repeat
      ? repeatRows(repeat, scopeAt(doc, frame.id), "design").rows.find((r) => r.key === tag.key)
      : undefined;
  return {
    source: repeat?.source ?? "",
    row: row ? row.index + 1 : null,
    iterator: tag.iterator,
    template: tag.source,
    blocked: frame ? detachBlocker(doc, frame.id) : null,
  };
}
