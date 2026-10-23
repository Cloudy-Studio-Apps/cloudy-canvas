import type { CanvasElement, ElementKinds } from "@canvas";

import { ChildHostKind, isDesignNode, type ChildResolveContext } from "../node";
import { siblingMasks } from "./sibling-masks";
import { childrenByParent } from "./tree-members";

/**
 * The tree's derived geometry (`resolveElements`): every child host (group, boolean) resolved
 * from its children in one pass, innermost first, so hosts nest in any order (a boolean in a
 * group in a boolean). Elements that aren't hosts come back as they were.
 */
export function resolveTree(elements: CanvasElement[], kinds: ElementKinds): CanvasElement[] {
  const hostOf = (el: CanvasElement) => {
    const kind = kinds.kindOf(el);
    return kind instanceof ChildHostKind ? kind : null;
  };
  if (!elements.some(hostOf)) return elements;
  const byId = new Map(elements.map((el) => [el.id, el]));
  const children = childrenByParent(elements);
  const masked = siblingMasks(elements);
  const resolved = new Map<string, CanvasElement>();
  const context: ChildResolveContext = {
    kinds,
    insideMask: (child) => {
      const mask = byId.get(masked.get(child.id) ?? "");
      return !!mask && isDesignNode(mask) && !mask.maskInverted;
    },
    childrenOf: (el) =>
      (children.get(el.id) ?? [])
        .map((id) => resolved.get(id) ?? byId.get(id))
        .filter((child) => child !== undefined),
  };

  const resolve = (el: CanvasElement, depth: number): CanvasElement => {
    const host = hostOf(el);
    if (!host || !isDesignNode(el)) return el;
    const known = resolved.get(el.id);
    if (known) return known;
    resolved.set(el.id, el); // A loop resolves to the node as stored.
    const kids = (children.get(el.id) ?? [])
      .map((id) => byId.get(id))
      .filter((child) => child !== undefined)
      .map((child) => (depth > elements.length ? child : resolve(child, depth + 1)));
    const result = host.resolveFromChildren(el, kids, context);
    resolved.set(el.id, result);
    return result;
  };

  return elements.map((el) => resolve(el, 0));
}
