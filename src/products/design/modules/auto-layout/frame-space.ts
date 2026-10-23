import { rotatePoint, toUnrotated, type Point } from "@canvas";

import type { DesignNode } from "../core";

const ORIGIN: Point = { x: 0, y: 0 };

/**
 * A world point in the frame's own space, where its layout runs: from its corner, unturned and
 * un-mirrored (a mirrored frame's horizontal layout runs right to left on screen, as in Figma).
 */
export function toFrameSpace(p: Point, frame: DesignNode): Point {
  const q = toUnrotated(p, frame);
  return { x: q.x - frame.x, y: q.y - frame.y };
}

/** An offset in the frame's own space, in the world: mirrored with it, then turned. */
export function fromFrameOffset(d: Point, frame: DesignNode): Point {
  const p = frame.mirrored ? { x: -d.x, y: d.y } : d;
  return rotatePoint(p, ORIGIN, frame.rotation ?? 0);
}
