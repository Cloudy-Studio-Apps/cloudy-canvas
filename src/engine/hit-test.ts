import type { SectionShape, Shape } from "./document/shapes.types";
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
  if (shape.type === "section") return hitTestSection(shape, p, tolerance);
  if (!rectContainsPoint(shapeBounds(shape), p, tolerance)) return false;
  if (shape.type !== "stroke" && shape.type !== "connector") return true;

  const { points } = shape;
  const local = { x: p.x - shape.x, y: p.y - shape.y };
  // Thin connectors get extra reach so they're easy to click.
  const reach = shape.type === "connector" ? CONNECTOR_REACH : 0;
  const radius = shape.size / 2 + tolerance + reach;
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

/** Sections are grabbed by their title or their border; clicks inside go to what's in them. */
function hitTestSection(section: SectionShape, p: Point, tolerance: number): boolean {
  if (rectContainsPoint(sectionTitleRect(section), p, tolerance)) return true;
  const band = tolerance + SECTION_BORDER_REACH;
  const outer = rectContainsPoint(shapeBounds(section), p, band);
  const inner =
    p.x > section.x + band &&
    p.x < section.x + section.w - band &&
    p.y > section.y + band &&
    p.y < section.y + section.h - band;
  return outer && !inner;
}
