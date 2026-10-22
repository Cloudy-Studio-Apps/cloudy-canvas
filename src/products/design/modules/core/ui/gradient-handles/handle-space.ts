import { rotatePoint, type Point } from "@canvas";

import type { NodeFrame, ViewMapping } from "./gradient-handles.types";

/** A point of the node's normalized box (0–1 on each axis) on the overlay. */
export function normalizedToScreen(p: Point, frame: NodeFrame, view: ViewMapping): Point {
  const world = rotatePoint(
    { x: frame.x + p.x * frame.w, y: frame.y + p.y * frame.h },
    frame,
    frame.rotation,
  );
  return { x: view.origin.x + world.x * view.zoom, y: view.origin.y + world.y * view.zoom };
}

/** An overlay point as a point of the node's normalized box. */
export function screenToNormalized(p: Point, frame: NodeFrame, view: ViewMapping): Point {
  const world = { x: (p.x - view.origin.x) / view.zoom, y: (p.y - view.origin.y) / view.zoom };
  const local = rotatePoint(world, frame, -frame.rotation);
  return {
    x: (local.x - frame.x) / Math.max(frame.w, 1e-6),
    y: (local.y - frame.y) / Math.max(frame.h, 1e-6),
  };
}
