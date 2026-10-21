import type { ConnectableShape, ConnectorSide } from "../document";
import { geoSideAnchor } from "../geo";
import type { Point } from "../geometry.types";

/** Outward direction of each side. */
export const SIDE_DIRECTIONS: Record<ConnectorSide, Point> = {
  top: { x: 0, y: -1 },
  right: { x: 1, y: 0 },
  bottom: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
};

export const SIDES: readonly ConnectorSide[] = ["top", "right", "bottom", "left"];

/** World point where a connector attaches to a side of a shape. */
export function sideAnchor(shape: ConnectableShape, side: ConnectorSide): Point {
  if (shape.type === "geo") {
    const local = geoSideAnchor(shape.kind, shape.w, shape.h, side);
    return { x: shape.x + local.x, y: shape.y + local.y };
  }
  const { x, y, w, h } = shape;
  switch (side) {
    case "top":
      return { x: x + w / 2, y };
    case "right":
      return { x: x + w, y: y + h / 2 };
    case "bottom":
      return { x: x + w / 2, y: y + h };
    case "left":
      return { x, y: y + h / 2 };
  }
}

/** The side of a shape that faces `toward`, weighing the shape's proportions. */
export function facingSide(shape: ConnectableShape, toward: Point): ConnectorSide {
  const dx = (toward.x - (shape.x + shape.w / 2)) / Math.max(shape.w, 1);
  const dy = (toward.y - (shape.y + shape.h / 2)) / Math.max(shape.h, 1);
  if (Math.abs(dx) >= Math.abs(dy)) return dx >= 0 ? "right" : "left";
  return dy >= 0 ? "bottom" : "top";
}

export function shapeCenter(shape: ConnectableShape): Point {
  return { x: shape.x + shape.w / 2, y: shape.y + shape.h / 2 };
}
