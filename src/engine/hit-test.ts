import type { Shape } from "./document/shapes.types";
import { noteBubbleLayout } from "./db/note-bubble";
import { ER_AGGREGATE_TITLE_H } from "./document/shape-defaults";
import { sectionTitleRect } from "./sections/section-title";
import { distanceToSegmentSq, rectContainsPoint } from "./geometry";
import type { Point, Rect } from "./geometry.types";

const CONNECTOR_REACH = 4;
const SECTION_BORDER_REACH = 2;

export function shapeBounds(shape: Shape): Rect {
  return { x: shape.x, y: shape.y, w: shape.w, h: shape.h };
}

/** Whether a world point hits the shape. `tolerance` is in world units. */
export function hitTestShape(shape: Shape, p: Point, tolerance: number): boolean {
  if (shape.type === "section") return hitTestFrame(shape, sectionTitleRect(shape), p, tolerance);
  if (shape.type === "er-aggregate") {
    const title = { x: shape.x, y: shape.y, w: shape.w, h: ER_AGGREGATE_TITLE_H };
    return hitTestFrame(shape, title, p, tolerance);
  }
  if (shape.type === "db-table") {
    // A table's note bubbles belong to it: clicking one selects (and drags) the table.
    const bubbles = noteBubbleLayout(shape)?.bubbles ?? [];
    if (bubbles.some((bubble) => rectContainsPoint(bubble.rect, p, tolerance))) return true;
  }
  if (!rectContainsPoint(shapeBounds(shape), p, tolerance)) return false;
  if (shape.type !== "stroke" && shape.type !== "connector" && shape.type !== "er-constraint") {
    return true;
  }

  const { points } = shape;
  const local = { x: p.x - shape.x, y: p.y - shape.y };
  // Thin lines get extra reach so they're easy to click.
  const reach = shape.type === "stroke" ? 0 : CONNECTOR_REACH;
  const size = shape.type === "er-constraint" ? 2 : shape.size;
  const radius = size / 2 + tolerance + reach;
  const radiusSq = radius * radius;
  if (points.length === 2) {
    return distanceToSegmentSq(local, points[0]!, points[1]!, points[0]!, points[1]!) <= radiusSq;
  }
  for (let i = 0; i + 3 < points.length; i += 2) {
    if (
      distanceToSegmentSq(local, points[i]!, points[i + 1]!, points[i + 2]!, points[i + 3]!) <=
      radiusSq
    ) {
      return true;
    }
  }
  return false;
}

/** Topmost shape under the point (shapes sorted bottom-to-top). */
export function topmostShapeAt(shapes: Shape[], p: Point, tolerance: number): Shape | undefined {
  for (let i = shapes.length - 1; i >= 0; i--) {
    const shape = shapes[i]!;
    if (hitTestShape(shape, p, tolerance)) return shape;
  }
  return undefined;
}

/**
 * Frames (sections, ER aggregations) are grabbed by their title or their border; clicks inside go
 * to what's in them.
 */
function hitTestFrame(section: Shape, title: Rect, p: Point, tolerance: number): boolean {
  if (rectContainsPoint(title, p, tolerance)) return true;
  const band = tolerance + SECTION_BORDER_REACH;
  const outer = rectContainsPoint(shapeBounds(section), p, band);
  const inner =
    p.x > section.x + band &&
    p.x < section.x + section.w - band &&
    p.y > section.y + band &&
    p.y < section.y + section.h - band;
  return outer && !inner;
}
