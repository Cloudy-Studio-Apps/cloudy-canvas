import { remapStackBindings, withoutBindingsUnder, type ElementPatch } from "@canvas";

import type { DesignNode } from "./design-node.types";

/** Where each entry of a stack goes when entry `i` is removed. */
export function removedAt(i: number): (j: number) => number | null {
  return (j) => (j === i ? null : j > i ? j - 1 : j);
}

/** Where each entry of a stack goes when one moves from `from` to `to`. */
export function movedTo(from: number, to: number): (j: number) => number | null {
  return (j) => {
    if (j === from) return to;
    if (from < to && j > from && j <= to) return j - 1;
    if (from > to && j >= to && j < from) return j + 1;
    return j;
  };
}

/**
 * The bindings a node keeps when its `field` stack (fills, strokes, effects) changes its entries
 * (`map`), or loses them all (`null`): what goes with the stack's patch so variables stay on their
 * paints. Empty when the node has no bindings.
 */
export function stackBindingsPatch(
  node: DesignNode,
  field: string,
  map: ((index: number) => number | null) | null,
): ElementPatch<DesignNode> {
  if (!node.bindings) return {};
  return {
    bindings: map
      ? remapStackBindings(node.bindings, field, map)
      : withoutBindingsUnder(node.bindings, field),
  };
}
