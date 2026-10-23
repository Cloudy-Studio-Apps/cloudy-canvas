import type { Container } from "pixi.js";

import type { OrderedChild } from "./ordered-child.types";

/**
 * Puts `child` into `parent` at its drawing order (binary search over children sorted by
 * `order`), moving it there from wherever it was.
 */
export function insertOrdered(parent: Container, child: OrderedChild): void {
  if (child.parent) child.parent.removeChild(child);
  const children = parent.children as OrderedChild[];
  let lo = 0;
  let hi = children.length;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (children[mid]!.order <= child.order) lo = mid + 1;
    else hi = mid;
  }
  parent.addChildAt(child, lo);
}
