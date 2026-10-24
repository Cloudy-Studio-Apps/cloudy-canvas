import type { CanvasDocument, CanvasElement, ElementKinds, ElementPatch } from "@canvas";

import { isNodeKind, type DesignNode } from "../../core";
import { placeholderPatch } from "./image-placeholder";

/** Whether a layer can show a placeholder: it takes fills and isn't locked. */
export function canHoldPlaceholder(el: CanvasElement, kinds: ElementKinds<object>): boolean {
  const kind = kinds.kindOf(el);
  return isNodeKind(kind) && kind.fillable && !el.locked;
}

/**
 * The patches turning each layer that can (`canHoldPlaceholder`) into a placeholder of its own
 * color (or `color`) and proportions; the others are left out.
 */
export function placeholderPatches(
  doc: CanvasDocument,
  kinds: ElementKinds<object>,
  elements: readonly CanvasElement[],
  color?: string,
): Map<string, ElementPatch> {
  const patches = new Map<string, ElementPatch>();
  for (const el of elements) {
    if (!canHoldPlaceholder(el, kinds)) continue;
    patches.set(el.id, placeholderPatch(doc, el as DesignNode, color) as ElementPatch);
  }
  return patches;
}
