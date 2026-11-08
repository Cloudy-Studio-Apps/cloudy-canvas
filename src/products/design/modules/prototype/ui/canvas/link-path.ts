import type { Rect } from "@canvas";
import type { LinkPath } from "./link-path.types";

/** How far inside the target's edge a forward arrow lands (screen px). */
const EDGE_INSET = 24;
/** How far clear of both screens a backward arrow swings (screen px). */
const SWING = 36;
/** The head's length: the curve stops this short of the edge. */
const HEAD = 6;

/**
 * The arrow from a layer to the screen it opens, all rects in screen px. Forward (the target's
 * left edge at or past the layer's right edge): from the layer's right middle to the target's left
 * edge. Backward: a layer in the lower half of its screen goes under both screens into the
 * target's bottom edge, otherwise over their tops into its top edge.
 */
export function linkPath(from: Rect, fromScreen: Rect, to: Rect): LinkPath {
  if (to.x >= from.x + from.w) {
    const sx = from.x + from.w;
    const sy = from.y + from.h / 2;
    const ex = to.x;
    const ey = Math.min(Math.max(sy, to.y + EDGE_INSET), to.y + to.h - EDGE_INSET);
    const k = Math.max(40, (ex - sx) / 2);
    return {
      d: `M ${sx} ${sy} C ${sx + k} ${sy}, ${ex - k} ${ey}, ${ex - HEAD} ${ey}`,
      origin: { x: sx, y: sy },
      end: { x: ex, y: ey },
      angle: 0,
    };
  }
  const under = from.y + from.h / 2 > fromScreen.y + fromScreen.h / 2;
  const sx = from.x + from.w / 2;
  const sy = under ? from.y + from.h : from.y;
  const ex = to.x + to.w / 2;
  const ey = under ? to.y + to.h : to.y;
  const lift = under
    ? Math.max(fromScreen.y + fromScreen.h, to.y + to.h) + SWING
    : Math.min(fromScreen.y, to.y) - SWING;
  const tip = under ? ey + HEAD : ey - HEAD;
  return {
    d: `M ${sx} ${sy} C ${sx} ${lift}, ${ex} ${lift}, ${ex} ${tip}`,
    origin: { x: sx, y: sy },
    end: { x: ex, y: ey },
    angle: under ? -90 : 90,
  };
}
