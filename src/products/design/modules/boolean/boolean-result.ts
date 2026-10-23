import {
  booleanPaths,
  identityKey,
  LruCache,
  mapPath,
  pathBounds,
  type CanvasElement,
  type Point,
} from "@canvas";

import { EMPTY_GEOMETRY, isDesignNode, type ChildResolveContext, type NodeGeometry } from "../core";
import type { BooleanElement } from "./boolean.types";
import { operandKey, operandShape } from "./operand-shape";
import type { BooleanResult } from "./boolean-result.types";

/** Results by operation and operands (relative to the first one), shared by every design. */
const RESULTS = new LruCache<string, BooleanResult>(512);

/** The geometry of each boolean the scene resolved (keyed by the resolved element). */
const GEOMETRIES = new WeakMap<CanvasElement, NodeGeometry>();

/**
 * A boolean as its operands make it: bounds round the result, and the result as its geometry
 * (`booleanGeometry`). Worked out again only when an operand's shape or place among the others
 * changes; moving them all together only moves the result.
 */
export function resolveBoolean(
  el: BooleanElement,
  children: readonly CanvasElement[],
  context: ChildResolveContext,
): BooleanElement {
  const operands = children.filter((child) => isDesignNode(child) && child.visible);
  const [first] = operands;
  const base: Point = first ? { x: first.x, y: first.y } : { x: el.x, y: el.y };
  const key = `${el.operation}|${operands.map((child) => operandKey(child, context, base)).join(";")}`;
  const result = RESULTS.getOrSet(key, () => {
    const shapes = operands
      .map((child) => operandShape(child, context, base))
      .filter((shape) => shape !== null);
    const shape = booleanPaths(
      el.operation,
      shapes.map((item) => ({ shape: item, fillRule: "nonzero" })),
    );
    const bounds = pathBounds(shape);
    if (!bounds) return { geometry: EMPTY_GEOMETRY, corner: { x: 0, y: 0 }, w: 0, h: 0 };
    const local = mapPath(shape, (p) => ({ x: p.x - bounds.x, y: p.y - bounds.y }));
    return {
      geometry: { fill: local, stroke: local },
      corner: { x: bounds.x, y: bounds.y },
      w: bounds.w,
      h: bounds.h,
    };
  });
  const resolved: BooleanElement = {
    ...el,
    x: base.x + result.corner.x,
    y: base.y + result.corner.y,
    w: result.w,
    h: result.h,
    rotation: 0,
  };
  GEOMETRIES.set(resolved, result.geometry);
  return resolved;
}

/** A resolved boolean's geometry (empty for one the scene hasn't resolved). */
export function booleanGeometry(el: BooleanElement): NodeGeometry {
  return GEOMETRIES.get(el) ?? EMPTY_GEOMETRY;
}

/** Equal for booleans with the same result (it's shared through the cache). */
export function booleanGeometryKey(el: BooleanElement): string {
  return String(identityKey(booleanGeometry(el)));
}
