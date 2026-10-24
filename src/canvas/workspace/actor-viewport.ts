import type { Rect } from "../geometry.types";

/** World-unit room left round what a viewport is moved to show. */
const VIEWPORT_PADDING = 80;
/** How far inside its edges a change must be for the viewport to stay where it is (fraction). */
const VIEWPORT_MARGIN = 0.08;

/** `rect` grown on its short side to `aspect` (width / height), round its centre. */
export function withAspect(rect: Rect, aspect: number): Rect {
  if (!(aspect > 0)) return rect;
  const w = Math.max(rect.w, rect.h * aspect);
  const h = Math.max(rect.h, rect.w / aspect);
  return { x: rect.x + (rect.w - w) / 2, y: rect.y + (rect.h - h) / 2, w, h };
}

/** The view that shows `rect` with some room round it, in the person's view proportions. */
export function showArea(rect: Rect, aspect: number): Rect {
  const padded = {
    x: rect.x - VIEWPORT_PADDING,
    y: rect.y - VIEWPORT_PADDING,
    w: rect.w + VIEWPORT_PADDING * 2,
    h: rect.h + VIEWPORT_PADDING * 2,
  };
  return withAspect(padded, aspect);
}

/**
 * Where a collaborator's view goes after it changed `bounds`, as a person's would: it stays put
 * while the change is well inside it, otherwise it centres on the change, as large as before or
 * large enough to hold it.
 */
export function followEdit(viewport: Rect, bounds: Rect, aspect: number): Rect {
  if (insideWithMargin(bounds, viewport)) return viewport;
  const needed = showArea(bounds, aspect);
  const w = Math.max(viewport.w, needed.w);
  const h = Math.max(viewport.h, needed.h);
  const cx = bounds.x + bounds.w / 2;
  const cy = bounds.y + bounds.h / 2;
  return withAspect({ x: cx - w / 2, y: cy - h / 2, w, h }, aspect);
}

function insideWithMargin(rect: Rect, area: Rect): boolean {
  const mx = area.w * VIEWPORT_MARGIN;
  const my = area.h * VIEWPORT_MARGIN;
  return (
    rect.x >= area.x + mx &&
    rect.y >= area.y + my &&
    rect.x + rect.w <= area.x + area.w - mx &&
    rect.y + rect.h <= area.y + area.h - my
  );
}
