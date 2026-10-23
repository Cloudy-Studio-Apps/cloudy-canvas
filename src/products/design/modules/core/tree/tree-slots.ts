import type { CanvasElement, ScopeSlot } from "@canvas";

import { isDesignNode, type DesignNode } from "../node";
import type { TreeSlots } from "./tree-slots.types";
import { isActiveMask, siblingMasks } from "./sibling-masks";

/** Slots worked out per scene refresh (the masks and effects hooks get the same list). */
const known = new WeakMap<readonly CanvasElement[], TreeSlots>();

/** Whether a node's effects are drawn: it shows, and some effect does. */
export function hasEffects(el: CanvasElement): el is DesignNode {
  return isDesignNode(el) && el.visible && el.effects.some((effect) => effect.visible);
}

/**
 * Where each node is drawn among the masks and effects, nested along the layer tree: a node with
 * effects is drawn in its own effect scope; that scope (or a node without effects) sits in its
 * mask's slot (a mask makes its own; the siblings it masks are masked by it), else where its
 * parent is drawn. So a shadowed group's mask, a masked layer's shadow and a blurred mask (a
 * feathered one) all nest as the tree does.
 */
export function treeSlots(elements: readonly CanvasElement[]): TreeSlots {
  const cached = known.get(elements);
  if (cached) return cached;
  const masked = siblingMasks(elements);
  const byId = new Map(elements.map((el) => [el.id, el]));
  const inner = new Map<string, ScopeSlot | null>();

  /** The slot a node's own view (or its effect scope) is drawn in, its effects left out. */
  const level = (el: CanvasElement, depth: number): ScopeSlot | null => {
    if (isActiveMask(el)) return { mask: el.id, role: "source" };
    const mask = masked.get(el.id);
    return mask ? { mask, role: "masked" } : parentInner(el, depth);
  };
  /** The innermost slot the node's parent is drawn in (where a mask's scope sits). */
  const parentInner = (el: CanvasElement, depth: number): ScopeSlot | null => {
    const parentId = isDesignNode(el) ? el.parentId : null;
    const parent = parentId ? byId.get(parentId) : undefined;
    return parent && depth <= elements.length ? innermost(parent, depth + 1) : null;
  };
  const innermost = (el: CanvasElement, depth: number): ScopeSlot | null => {
    const memo = inner.get(el.id);
    if (memo !== undefined) return memo;
    inner.set(el.id, null); // A loop draws at the top.
    const slot = hasEffects(el) ? { effect: el.id } : level(el, depth);
    inner.set(el.id, slot);
    return slot;
  };

  const slots: TreeSlots = {
    homeOf: (id) => {
      const el = byId.get(id);
      return el ? innermost(el, 0) : null;
    },
    effectHome: (id) => {
      const el = byId.get(id);
      return el ? level(el, 0) : null;
    },
    maskHome: (id) => {
      const el = byId.get(id);
      return el ? parentInner(el, 0) : null;
    },
    masked,
  };
  known.set(elements, slots);
  return slots;
}
