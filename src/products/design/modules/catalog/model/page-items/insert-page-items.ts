import { nKeysBetween, type CanvasDocument, type Point } from "@canvas";

import type { PageItemDefinition, PageItemTarget } from "./page-item-definition.types";
import { placePageItem } from "./place-page-item";

/** The highest sibling index among `frame`'s own layers ("" when it has none). */
function topIndex(doc: CanvasDocument, frame: string): string {
  let top = "";
  for (const id of doc.ids()) {
    if (doc.field(id, "parentId") !== frame) continue;
    const index = doc.field(id, "index");
    if (typeof index === "string" && index > top) top = index;
  }
  return top;
}

/**
 * Puts page item `item` on each of `targets` (a master's sides, a page), on top of the frame's
 * layers, in one undo step; on a page the sync then fills in its text. `at` (one target) is
 * where it's dropped. Returns the new texts' ids.
 */
export function insertPageItems(
  doc: CanvasDocument,
  item: PageItemDefinition,
  targets: readonly PageItemTarget[],
  margin: number,
  at?: Point,
): string[] {
  if (targets.length === 0) return [];
  const nodes = targets.map((target) => {
    const [index = "a0"] = nKeysBetween(topIndex(doc, target.frame.id) || null, null, 1);
    return placePageItem({ item, target, margin, index, at });
  });
  doc.checkpoint();
  doc.batch(() => {
    for (const node of nodes) doc.add(node);
  });
  return nodes.map((node) => node.id);
}
