import { ELEMENT_DEFAULTS } from "../elements/element.defaults";
import type { Point, Rect } from "../geometry.types";
import { rotatePoint } from "../rotation";
import type { ResizeHandle, ResizeOptions } from "./handles.types";

/** Corners first, so they win where they overlap the edge handles on small shapes. */
export const RESIZE_HANDLES: readonly ResizeHandle[] = ["nw", "ne", "se", "sw", "n", "e", "s", "w"];

const CURSORS: Record<ResizeHandle, string> = {
  nw: "nwse-resize",
  se: "nwse-resize",
  ne: "nesw-resize",
  sw: "nesw-resize",
  n: "ns-resize",
  s: "ns-resize",
  e: "ew-resize",
  w: "ew-resize",
};

/** Each handle's direction from the box's center, in degrees (counterclockwise from east). */
const ANGLES: Record<ResizeHandle, number> = {
  e: 0,
  ne: 45,
  n: 90,
  nw: 135,
  w: 180,
  sw: 225,
  s: 270,
  se: 315,
};

/** The four resize cursors by direction (mod 180°, in 45° steps from east). */
const CURSORS_BY_ANGLE = ["ew-resize", "nesw-resize", "ns-resize", "nwse-resize"];

/** The cursor for dragging `handle` of a box turned by `rotation` degrees. */
export function resizeCursor(handle: ResizeHandle, rotation = 0): string {
  if (!rotation) return CURSORS[handle];
  const step = Math.round((ANGLES[handle] + rotation) / 45);
  return CURSORS_BY_ANGLE[((step % 4) + 4) % 4]!;
}

/** Where `handle` sits on `rect` turned by `rotation` degrees around its top-left corner. */
export function resizeHandlePoint(rect: Rect, handle: ResizeHandle, rotation = 0): Point {
  const { x, y, w, h } = rect;
  const hx = handle.includes("w") ? x : handle.includes("e") ? x + w : x + w / 2;
  const hy = handle.includes("n") ? y : handle.includes("s") ? y + h : y + h / 2;
  return rotatePoint({ x: hx, y: hy }, rect, rotation);
}

/** The handle within `tolerance` (world units) of the point, on `rect` turned by `rotation`. */
export function resizeHandleAt(
  rect: Rect,
  p: Point,
  tolerance: number,
  rotation = 0,
): ResizeHandle | null {
  const q = rotatePoint(p, rect, -rotation);
  return (
    RESIZE_HANDLES.find((handle) => {
      const at = resizeHandlePoint(rect, handle);
      return Math.abs(q.x - at.x) <= tolerance && Math.abs(q.y - at.y) <= tolerance;
    }) ?? null
  );
}

/**
 * The point of `rect` that stays put while `handle` is dragged with the proportions kept: the
 * opposite corner, the middle of the opposite side, or the center with `fromCenter`.
 */
export function resizeAnchor(rect: Rect, handle: ResizeHandle, fromCenter: boolean): Point {
  const { x, y, w, h } = rect;
  const west = handle.includes("w");
  const east = handle.includes("e");
  const north = handle.includes("n");
  const south = handle.includes("s");
  return {
    x: fromCenter || !(west || east) ? x + w / 2 : west ? x + w : x,
    y: fromCenter || !(north || south) ? y + h / 2 : north ? y + h : y,
  };
}

/**
 * The rect after dragging `handle` by (dx, dy). The opposite side stays put, or the center with
 * `fromCenter`; with `keepRatio` the proportions are kept. Never smaller than
 * `ELEMENT_DEFAULTS.minSize`, and never flipped.
 */
export function resizeRect(
  origin: Rect,
  handle: ResizeHandle,
  dx: number,
  dy: number,
  { keepRatio, fromCenter }: ResizeOptions,
): Rect {
  const west = handle.includes("w");
  const east = handle.includes("e");
  const north = handle.includes("n");
  const south = handle.includes("s");
  // Round the center, both sides move, so the dragged one follows the pointer.
  const sides = fromCenter ? 2 : 1;
  let w = origin.w + (east ? dx : west ? -dx : 0) * sides;
  let h = origin.h + (south ? dy : north ? -dy : 0) * sides;
  w = Math.max(ELEMENT_DEFAULTS.minSize, w);
  h = Math.max(ELEMENT_DEFAULTS.minSize, h);

  if (keepRatio && origin.w > 0 && origin.h > 0) {
    const ratio = origin.w / origin.h;
    if (!(east || west)) w = h * ratio;
    else if (!(north || south)) h = w / ratio;
    else if (w / origin.w > h / origin.h) h = w / ratio;
    else w = h * ratio;
  }

  const centerX = fromCenter || !(west || east);
  const centerY = fromCenter || !(north || south);
  const x = centerX ? origin.x + (origin.w - w) / 2 : west ? origin.x + origin.w - w : origin.x;
  const y = centerY ? origin.y + (origin.h - h) / 2 : north ? origin.y + origin.h - h : origin.y;
  return { x: Math.round(x), y: Math.round(y), w: Math.round(w), h: Math.round(h) };
}
