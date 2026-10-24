import type { Point, Rect } from "@canvas";
import type { ViewMapping } from "../../overlay";

/** A world point on the canvas's overlays (see `useViewMapping`). */
export function pointToScreen({ origin, zoom }: ViewMapping, p: Point): Point {
  return { x: origin.x + p.x * zoom, y: origin.y + p.y * zoom };
}

/** A world rect on the canvas's overlays. */
export function rectToScreen(view: ViewMapping, r: Rect): Rect {
  const { x, y } = pointToScreen(view, r);
  return { x, y, w: r.w * view.zoom, h: r.h * view.zoom };
}
