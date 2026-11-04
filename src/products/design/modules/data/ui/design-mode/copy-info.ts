import type { CanvasDocument, CanvasElement } from "@canvas";

import { dataCopyTag, repeatOf, repeatRows, scopeAt } from "../../repeat";
import type { CopyInfo } from "./copy-info.types";

/** Whether a frame, or one around it, is itself a copy an iterator made. */
function insideCopy(doc: CanvasDocument, frame: CanvasElement): boolean {
  const seen = new Set<string>();
  for (let at: CanvasElement | undefined = frame; at && !seen.has(at.id);) {
    seen.add(at.id);
    if (dataCopyTag(at)) return true;
    const parentId = doc.field(at.id, "parentId");
    at = typeof parentId === "string" ? doc.get(parentId) : undefined;
  }
  return false;
}

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
    template: tag.source,
    nested: frame ? insideCopy(doc, frame) : false,
  };
}
