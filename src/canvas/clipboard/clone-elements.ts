import { createId } from "@shared/core";

import { compareByIndex } from "../document";
import type { CanvasElement } from "../elements";
import type { ClonedElements } from "./clone-elements.types";
import { remapIds } from "./remap-ids";

/**
 * Copies of `elements` with fresh ids and the given `indexes` (ascending, one per element), in
 * their original z-order. References between the copied elements point at the copies; references
 * to anything else are left as they were.
 */
export function cloneElements(
  elements: readonly CanvasElement[],
  indexes: readonly string[],
): ClonedElements {
  const sorted = [...elements].sort(compareByIndex);
  const ids = new Map(sorted.map((el) => [el.id, createId()]));
  const copies = sorted.map((el, i) => ({ ...remapIds(el, ids), index: indexes[i] ?? el.index }));
  return { copies, ids };
}
