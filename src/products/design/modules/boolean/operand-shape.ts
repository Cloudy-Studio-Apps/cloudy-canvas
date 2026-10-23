import { booleanPaths, placePath, type CanvasElement, type PathShape, type Point } from "@canvas";

import {
  DesignNodeKind,
  hasVisibleStroke,
  isDesignNode,
  strokeKey,
  type ChildResolveContext,
} from "../core";

/**
 * What a layer adds to a boolean, in coordinates relative to `base` (so the same layers moved
 * together give the same shape): its fill area, or, when it fills nothing, the area its strokes
 * cover (a line); a group adds its layers' union. `null` while it has no shape yet (a text whose
 * font is loading) or when it's hidden.
 */
export function operandShape(
  el: CanvasElement,
  context: Pick<ChildResolveContext, "kinds" | "childrenOf">,
  base: Point,
  depth = 0,
): PathShape | null {
  if (!isDesignNode(el) || !el.visible) return null;
  const kind = context.kinds.kindOf(el);
  if (!(kind instanceof DesignNodeKind)) return null;
  if (!kind.ownsShape) {
    if (depth > 64) return null;
    const parts = context
      .childrenOf(el)
      .map((child) => operandShape(child, context, base, depth + 1))
      .filter((shape) => shape !== null);
    return parts.length > 0
      ? booleanPaths(
          "union",
          parts.map((shape) => ({ shape, fillRule: "nonzero" })),
        )
      : null;
  }
  const geometry = kind.geometry(el);
  if (!geometry) return null;
  const placement = { x: el.x - base.x, y: el.y - base.y, rotation: el.rotation ?? 0 };
  if (geometry.fill.contours.length > 0) return placePath(geometry.fill, placement);
  if (!hasVisibleStroke(el)) return { contours: [] };
  return placePath(kind.strokeArea(el), placement);
}

/**
 * What `operandShape` depends on, as a string: equal keys give equal shapes, so booleans only work
 * their result out again when a layer's shape or place among the others changes.
 */
export function operandKey(
  el: CanvasElement,
  context: Pick<ChildResolveContext, "kinds" | "childrenOf">,
  base: Point,
  depth = 0,
): string {
  if (!isDesignNode(el) || !el.visible) return "-";
  const kind = context.kinds.kindOf(el);
  if (!(kind instanceof DesignNodeKind)) return "-";
  if (!kind.ownsShape) {
    if (depth > 64) return "-";
    const parts = context
      .childrenOf(el)
      .map((child) => operandKey(child, context, base, depth + 1));
    return `(${parts.join(";")})`;
  }
  const place = `${el.x - base.x},${el.y - base.y},${el.rotation ?? 0}`;
  const stroke = `${strokeKey(el)},${hasVisibleStroke(el)}`;
  return `${kind.type}:${kind.geometryKey(el)}@${place}/${stroke}`;
}
