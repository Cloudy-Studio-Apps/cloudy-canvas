import type { CanvasDocument, CanvasElement, ElementKinds } from "@canvas";

import { nextLayerName, selectionRoots, wrapNodes } from "../core";
import { createFrame } from "./frame.factory";

/**
 * Figma's "Frame selection": puts the nodes (those whose ancestors aren't among them) into a new
 * frame round them, as one undo step, where the topmost of them was. It has no fill and doesn't
 * clip, so nothing looks different until it's styled. Returns its id, or `null` when there was
 * nothing to frame. `elements` are the scene's, bottom to top.
 */
export function frameNodes(
  doc: CanvasDocument,
  ids: ReadonlySet<string>,
  elements: readonly CanvasElement[],
  kinds: ElementKinds,
): string | null {
  const nodes = selectionRoots(ids, elements);
  if (nodes.length === 0) return null;
  const name = nextLayerName(doc.all(), "Frame");
  doc.checkpoint();
  return wrapNodes(doc, nodes, kinds, (rect, index, parentId) => ({
    ...createFrame(rect, name, index, parentId),
    fills: [],
    clipsContent: false,
  }));
}
