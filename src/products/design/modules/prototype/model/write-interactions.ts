import type { CanvasDocument, ElementPatch } from "@canvas";

import type { PrototypeInteraction } from "./interaction.types";

/** The patch that gives a node `list` as its interactions (`null` clears the field). */
export function interactionsPatch(list: readonly PrototypeInteraction[]): ElementPatch {
  return { interactions: list.length > 0 ? [...list] : null } as ElementPatch;
}

/**
 * Replaces a node's interactions with `list` in one `doc.update` (no checkpoint: the caller makes
 * the undo step). An empty list clears the field.
 */
export function writeInteractions(
  doc: CanvasDocument,
  nodeId: string,
  list: readonly PrototypeInteraction[],
): void {
  doc.update(nodeId, interactionsPatch(list));
}
