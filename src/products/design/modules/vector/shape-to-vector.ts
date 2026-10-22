import type { CanvasElement, ElementKinds } from "@canvas";

import { BoxShapeKind, isDesignNode } from "../core";
import { createVector } from "./vector.factory";
import type { VectorElement } from "./vector.types";

/**
 * The vector a shape with a vector outline (rectangle, ellipse, polygon, star) becomes when its
 * points are edited: same id, place, look and lock, as in Figma. `null` for anything else.
 */
export function shapeToVector(el: CanvasElement, kinds: ElementKinds): VectorElement | null {
  const kind = kinds.kindOf(el);
  if (!(kind instanceof BoxShapeKind) || !isDesignNode(el)) return null;
  const network = kind.vectorNetwork(el);
  if (!network) return null;
  const world = {
    ...network,
    vertices: network.vertices.map((v) => ({ x: v.x + el.x, y: v.y + el.y })),
  };
  return {
    ...createVector(world, el.name, el.index, el.parentId, el),
    id: el.id,
    visible: el.visible,
    opacity: el.opacity,
    ...(el.locked ? { locked: true } : {}),
  };
}
