import { rotatePoint, type Point } from "@canvas";

import type { OverlayFrame, ViewMapping } from "./overlay.types";

/**
 * A point of the element's normalized box (0–1 on each axis, in what it draws: mirrored with a
 * mirrored element) on the overlay.
 */
export function normalizedToScreen(p: Point, frame: OverlayFrame, view: ViewMapping): Point {
  const x = frame.mirrored ? 1 - p.x : p.x;
  const world = rotatePoint(
    { x: frame.x + x * frame.w, y: frame.y + p.y * frame.h },
    frame,
    frame.rotation,
  );
  return { x: view.origin.x + world.x * view.zoom, y: view.origin.y + world.y * view.zoom };
}

/** An overlay point as a point of the element's normalized box. */
export function screenToNormalized(p: Point, frame: OverlayFrame, view: ViewMapping): Point {
  const local = screenToLocal(p, frame, view);
  return {
    x: local.x / Math.max(frame.w, 1e-6),
    y: local.y / Math.max(frame.h, 1e-6),
  };
}

/**
 * An overlay point in the element's own frame: world units from its corner, unturned (and, for a
 * mirrored element, un-mirrored: in the frame of what it draws).
 */
export function screenToLocal(p: Point, frame: OverlayFrame, view: ViewMapping): Point {
  const world = { x: (p.x - view.origin.x) / view.zoom, y: (p.y - view.origin.y) / view.zoom };
  const local = rotatePoint(world, frame, -frame.rotation);
  const x = local.x - frame.x;
  return { x: frame.mirrored ? frame.w - x : x, y: local.y - frame.y };
}
