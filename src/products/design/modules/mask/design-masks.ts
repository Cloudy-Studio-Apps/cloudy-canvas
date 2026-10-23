import {
  elementBounds,
  toUnrotated,
  type CanvasElement,
  type ElementKinds,
  type ElementMask,
  type ElementMasks,
  type MaskShape,
  type MaskSlot,
} from "@canvas";

import {
  childrenByParent,
  DesignNodeKind,
  isActiveMask,
  isDesignNode,
  siblingMasks,
  type DesignNode,
} from "../core";

/**
 * The design's masks (`CanvasProduct.masks`), as in Figma: each visible mask masks the siblings
 * above it up to the next mask (`siblingMasks`), with everything they hold, and isn't drawn
 * itself; with what it holds, it makes the mask. Masks nest: a mask inside a masked layer, or
 * inside another mask, sits in that one's slot.
 */
export function designMasks(elements: readonly CanvasElement[], kinds: ElementKinds): ElementMasks {
  const masked = siblingMasks(elements);
  const homes = new Map<string, MaskSlot>();
  const masks = new Map<string, ElementMask>();
  if (masked.size === 0 && !elements.some(isActiveMask)) return { masks, homes };

  const byId = new Map(elements.map((el) => [el.id, el]));
  const children = childrenByParent(elements);
  const slots = new Map<string, MaskSlot | null>();

  /** The slot a node's parent draws in (where a mask's scope sits). */
  const parentSlot = (node: DesignNode, depth: number): MaskSlot | null => {
    const parent = node.parentId ? byId.get(node.parentId) : undefined;
    return parent && depth <= elements.length ? slotOf(parent, depth + 1) : null;
  };
  /** The innermost slot a node draws in: its own mask, the mask over it, or its parent's. */
  const slotOf = (el: CanvasElement, depth: number): MaskSlot | null => {
    if (!isDesignNode(el)) return null;
    const known = slots.get(el.id);
    if (known !== undefined) return known;
    slots.set(el.id, null); // A loop draws at the top.
    const mask = masked.get(el.id);
    const slot: MaskSlot | null = isActiveMask(el)
      ? { mask: el.id, role: "source" }
      : mask
        ? { mask, role: "masked" }
        : parentSlot(el, depth);
    slots.set(el.id, slot);
    return slot;
  };

  for (const el of elements) {
    const slot = slotOf(el, 0);
    if (slot) homes.set(el.id, slot);
    if (!isActiveMask(el)) continue;
    const parts = maskParts(el, byId, children);
    masks.set(el.id, {
      id: el.id,
      mode: el.maskType,
      inverted: el.maskInverted,
      home: parentSlot(el, 0),
      bounds: elementBounds(kinds.kindOf(el), el),
      shape: el.maskType === "vector" ? maskShapes(parts, kinds) : null,
      contains: (p) =>
        parts.some((part) => kinds.kindOf(part).hitTest(part, toUnrotated(p, part), 0)),
    });
  }
  return { masks, homes };
}

/** The mask and the visible nodes it holds: what the mask is made of. */
function maskParts(
  mask: DesignNode,
  byId: ReadonlyMap<string, CanvasElement>,
  children: ReadonlyMap<string, string[]>,
): DesignNode[] {
  const parts: DesignNode[] = [mask];
  for (let i = 0; i < parts.length && i <= byId.size; i++) {
    for (const id of children.get(parts[i]!.id) ?? []) {
      const child = byId.get(id);
      if (child && isDesignNode(child) && child.visible) parts.push(child);
    }
  }
  return parts;
}

/** The outlines a vector mask is made of; `null` when a part has none (it masks by pixels). */
function maskShapes(parts: readonly DesignNode[], kinds: ElementKinds): MaskShape[] | null {
  const shapes: MaskShape[] = [];
  for (const part of parts) {
    const kind = kinds.kindOf(part);
    const trace = kind instanceof DesignNodeKind ? kind.fillOutline(part) : null;
    if (!trace) return null;
    shapes.push({ x: part.x, y: part.y, rotation: part.rotation ?? 0, trace });
  }
  return shapes;
}
