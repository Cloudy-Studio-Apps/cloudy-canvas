import { rotatePoint, type CanvasElement, type ElementKinds } from "@canvas";

import { BoxShapeKind, isDesignNode } from "../core";
import { createVector } from "./vector.factory";
import type { VectorElement } from "./vector.types";

/**
 * The vector a shape with a vector outline (rectangle, ellipse, polygon, star) becomes when its
 * points are edited: same id, place, turn, look and lock, as in Figma. `null` for anything else.
 */
export function shapeToVector(el: CanvasElement, kinds: ElementKinds): VectorElement | null {
  const kind = kinds.kindOf(el);
  if (!(kind instanceof BoxShapeKind) || !isDesignNode(el)) return null;
  const network = kind.vectorNetwork(el);
  if (!network) return null;
  // Placed in the shape's own frame, then its corner turned like the shape's.
  const vector = createVector(network, el.name, el.index, el.parentId, el);
  const rotation = el.rotation ?? 0;
  // A mirrored shape stays mirrored: its corner is on the right of what it draws.
  const mirrored = el.mirrored ?? false;
  const left = mirrored ? el.w - vector.x - vector.w : vector.x;
  const corner = rotatePoint({ x: el.x + left, y: el.y + vector.y }, el, rotation);
  return {
    ...vector,
    x: corner.x,
    y: corner.y,
    rotation,
    mirrored,
    id: el.id,
    visible: el.visible,
    opacity: el.opacity,
    ...(el.locked ? { locked: true } : {}),
  };
}
