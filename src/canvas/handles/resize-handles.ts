import { ELEMENT_DEFAULTS } from "../elements/element.defaults";
import type { Point, Rect } from "../geometry.types";
import type { ResizeHandle } from "./handles.types";

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

export function resizeCursor(handle: ResizeHandle): string {
  return CURSORS[handle];
}

export function resizeHandlePoint({ x, y, w, h }: Rect, handle: ResizeHandle): Point {
  const hx = handle.includes("w") ? x : handle.includes("e") ? x + w : x + w / 2;
  const hy = handle.includes("n") ? y : handle.includes("s") ? y + h : y + h / 2;
  return { x: hx, y: hy };
}

/** The handle within `tolerance` (world units) of the point. */
export function resizeHandleAt(rect: Rect, p: Point, tolerance: number): ResizeHandle | null {
  return (
    RESIZE_HANDLES.find((handle) => {
      const q = resizeHandlePoint(rect, handle);
      return Math.abs(p.x - q.x) <= tolerance && Math.abs(p.y - q.y) <= tolerance;
    }) ?? null
  );
}

/**
 * The rect after dragging `handle` by (dx, dy). The opposite side stays put; with `keepRatio` the
 * proportions are kept. Never smaller than `ELEMENT_DEFAULTS.minSize`, and never flipped.
 */
export function resizeRect(
  origin: Rect,
  handle: ResizeHandle,
  dx: number,
  dy: number,
  keepRatio: boolean,
): Rect {
  const west = handle.includes("w");
  const east = handle.includes("e");
  const north = handle.includes("n");
  const south = handle.includes("s");
  let w = origin.w + (east ? dx : west ? -dx : 0);
  let h = origin.h + (south ? dy : north ? -dy : 0);
  w = Math.max(ELEMENT_DEFAULTS.minSize, w);
  h = Math.max(ELEMENT_DEFAULTS.minSize, h);

  if (keepRatio && origin.w > 0 && origin.h > 0) {
    const ratio = origin.w / origin.h;
    if (!(east || west)) w = h * ratio;
    else if (!(north || south)) h = w / ratio;
    else if (w / origin.w > h / origin.h) h = w / ratio;
    else w = h * ratio;
  }

  const x = west ? origin.x + origin.w - w : east ? origin.x : origin.x + (origin.w - w) / 2;
  const y = north ? origin.y + origin.h - h : south ? origin.y : origin.y + (origin.h - h) / 2;
  return { x: Math.round(x), y: Math.round(y), w: Math.round(w), h: Math.round(h) };
}
