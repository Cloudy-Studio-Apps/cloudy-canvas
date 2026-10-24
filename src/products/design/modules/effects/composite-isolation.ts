import { elementBounds, type CanvasElement, type ElementKinds, type Rect } from "@canvas";

import { DesignNodeKind, hasEffects, isDesignNode, layerComposite } from "../core";

/** Past this many parts, a scope is isolated without checking how they overlap. */
const MAX_PARTS = 64;

/**
 * Whether a node's composite must draw what it holds on its own first: it blends, or what it
 * draws overlaps (a group at 50% whose layers overlap mustn't darken where they do), or a part
 * casts effects or blends itself. Otherwise its opacity can be handed down to each part.
 */
export function isolatesComposite(
  el: CanvasElement,
  kinds: ElementKinds,
  byId: ReadonlyMap<string, CanvasElement>,
  children: ReadonlyMap<string, readonly string[]>,
): boolean {
  const composite = layerComposite(el, kinds);
  if (!composite || composite.blendMode !== "normal") return true;
  const parts: Rect[] = [];
  if (drawsItself(el, kinds)) parts.push(elementBounds(kinds.kindOf(el), el));
  const stack = [...(children.get(el.id) ?? [])];
  const seen = new Set<string>();
  while (stack.length > 0) {
    const id = stack.pop();
    if (id === undefined || seen.has(id)) continue;
    seen.add(id);
    const part = byId.get(id);
    if (!part || !isDesignNode(part) || !part.visible) continue;
    const blend = layerComposite(part, kinds)?.blendMode ?? "normal";
    if (hasEffects(part, kinds) || blend !== "normal") return true;
    if (drawsItself(part, kinds)) {
      if (parts.length >= MAX_PARTS) return true;
      const box = elementBounds(kinds.kindOf(part), part);
      if (parts.some((other) => overlaps(box, other))) return true;
      parts.push(box);
    }
    // A boolean draws its operands itself: they're not parts of their own.
    const kind = kinds.kindOf(part);
    if (!(kind instanceof DesignNodeKind) || kind.drawsChildren) {
      stack.push(...(children.get(id) ?? []));
    }
  }
  return false;
}

/**
 * Whether the node draws something of its own: anything but a layer made only of its children
 * (a group).
 */
function drawsItself(el: CanvasElement, kinds: ElementKinds): boolean {
  const kind = kinds.kindOf(el);
  return !(kind instanceof DesignNodeKind && kind.childHost && kind.drawsChildren);
}

function overlaps(a: Rect, b: Rect): boolean {
  return a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;
}
