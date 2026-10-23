import {
  elementBounds,
  toUnrotated,
  type CanvasElement,
  type ElementKinds,
  type ElementMask,
  type ElementMasks,
  type MaskShape,
  type ScopeSlot,
} from "@canvas";

import {
  childrenByParent,
  DesignNodeKind,
  isActiveMask,
  isDesignNode,
  treeSlots,
  type DesignNode,
} from "../core";

/**
 * The design's masks (`CanvasProduct.masks`), as in Figma: each visible mask masks the siblings
 * above it up to the next mask (`siblingMasks`), with everything they hold, and isn't drawn
 * itself; with what it holds, it makes the mask. Masks nest with each other and with effects as
 * the layer tree does (`treeSlots`).
 */
export function designMasks(elements: readonly CanvasElement[], kinds: ElementKinds): ElementMasks {
  const slots = treeSlots(elements, kinds);
  const homes = new Map<string, ScopeSlot>();
  const masks = new Map<string, ElementMask>();
  if (slots.masked.size === 0 && !elements.some(isActiveMask)) return { masks, homes };

  const byId = new Map(elements.map((el) => [el.id, el]));
  const children = childrenByParent(elements);
  for (const el of elements) {
    const slot = slots.homeOf(el.id);
    if (slot) homes.set(el.id, slot);
    if (!isActiveMask(el)) continue;
    const parts = maskParts(el, byId, children, kinds);
    masks.set(el.id, {
      id: el.id,
      mode: el.maskType,
      inverted: el.maskInverted,
      home: slots.maskHome(el.id),
      bounds: elementBounds(kinds.kindOf(el), el),
      shape: el.maskType === "vector" ? maskShapes(parts, kinds) : null,
      contains: (p) =>
        parts.some((part) => kinds.kindOf(part).hitTest(part, toUnrotated(p, part), 0)),
    });
  }
  return { masks, homes };
}

/**
 * The mask and the visible nodes it holds: what the mask is made of (not what a boolean holds,
 * whose result stands for it).
 */
function maskParts(
  mask: DesignNode,
  byId: ReadonlyMap<string, CanvasElement>,
  children: ReadonlyMap<string, string[]>,
  kinds: ElementKinds,
): DesignNode[] {
  const parts: DesignNode[] = [mask];
  for (let i = 0; i < parts.length && i <= byId.size; i++) {
    const part = parts[i]!;
    const kind = kinds.kindOf(part);
    if (kind instanceof DesignNodeKind && !kind.drawsChildren) continue;
    for (const id of children.get(part.id) ?? []) {
      const child = byId.get(id);
      if (child && isDesignNode(child) && child.visible) parts.push(child);
    }
  }
  return parts;
}

/**
 * The shapes a vector mask is made of: what each part's fills cover. `null` when a part has no
 * such shape (a text not outlined yet, a line), so the mask goes by its pixels.
 */
function maskShapes(parts: readonly DesignNode[], kinds: ElementKinds): MaskShape[] | null {
  const shapes: MaskShape[] = [];
  for (const part of parts) {
    const kind = kinds.kindOf(part);
    if (!(kind instanceof DesignNodeKind)) return null;
    if (!kind.ownsShape) continue;
    const geometry = kind.geometry(part);
    if (!geometry || geometry.fill.contours.length === 0) return null;
    shapes.push({ x: part.x, y: part.y, rotation: part.rotation ?? 0, path: geometry.fill });
  }
  return shapes;
}
