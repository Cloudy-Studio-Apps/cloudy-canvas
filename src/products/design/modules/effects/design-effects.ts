import {
  elementBounds,
  unionRects,
  type CanvasElement,
  type EffectScope,
  type EffectSlot,
  type ElementEffects,
  type ElementKinds,
  type Rect,
} from "@canvas";

import { childrenByParent, hasEffects, isDesignNode, treeSlots } from "../core";

/**
 * The design's effects (`CanvasProduct.effects`): a visible node with visible effects gets a
 * scope that draws them over it and everything it holds, together (a group's shadow is its
 * layers' shadow, as in Figma), nested with the masks along the tree (`treeSlots`).
 */
export function designEffects(
  elements: readonly CanvasElement[],
  kinds: ElementKinds,
): ElementEffects {
  const scopes = new Map<string, EffectScope>();
  const homes = new Map<string, EffectSlot>();
  if (!elements.some(hasEffects)) return { scopes, homes };

  const slots = treeSlots(elements);
  const byId = new Map(elements.map((el) => [el.id, el]));
  const children = childrenByParent(elements);
  const reach = new Map<string, Rect | null>();
  /** Where a node and what it holds are, together. */
  const extent = (el: CanvasElement, depth: number): Rect | null => {
    const known = reach.get(el.id);
    if (known !== undefined) return known;
    reach.set(el.id, null);
    const parts = [elementBounds(kinds.kindOf(el), el)];
    for (const id of children.get(el.id) ?? []) {
      const child = byId.get(id);
      const box = child && depth <= elements.length ? extent(child, depth + 1) : null;
      if (box) parts.push(box);
    }
    const box = unionRects(parts);
    reach.set(el.id, box);
    return box;
  };

  for (const el of elements) {
    const home = slots.homeOf(el.id);
    if (home && "effect" in home) homes.set(el.id, home);
    if (!hasEffects(el) || !isDesignNode(el)) continue;
    scopes.set(el.id, {
      id: el.id,
      effects: el.effects.filter((effect) => effect.visible),
      home: slots.effectHome(el.id),
      box: { x: el.x, y: el.y, w: el.w, h: el.h },
      rotation: el.rotation ?? 0,
      bounds: extent(el, 0) ?? elementBounds(kinds.kindOf(el), el),
    });
  }
  return { scopes, homes };
}
