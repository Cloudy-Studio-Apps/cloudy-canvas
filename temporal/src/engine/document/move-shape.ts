import type { ConnectorEnd, Shape, ShapePatch } from "./shapes.types";

/** Patch that moves a shape by (dx, dy) from `origin`. Connectors move only their free ends. */
export function moveShapePatch(origin: Shape, dx: number, dy: number): ShapePatch {
  if (origin.type === "connector") {
    return { start: moveEnd(origin.start, dx, dy), end: moveEnd(origin.end, dx, dy) };
  }
  return { x: Math.round(origin.x + dx), y: Math.round(origin.y + dy) };
}

function moveEnd(end: ConnectorEnd, dx: number, dy: number): ConnectorEnd {
  if (end.shapeId) return end;
  return { ...end, x: Math.round(end.x + dx), y: Math.round(end.y + dy) };
}
