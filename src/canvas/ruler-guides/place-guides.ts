import type { CanvasElement, ElementKinds } from "../elements";
import type { Point } from "../geometry.types";
import { rotatePoint } from "../rotation";
import type { PlacedGuide, RulerGuide } from "./ruler-guides.types";

/**
 * Where the guides show: page guides as they are, a frame's guides from its corner inside its
 * bounds, turned with it. Guides of a frame that's gone are left out.
 */
export function placeGuides(
  guides: readonly RulerGuide[],
  get: (id: string) => CanvasElement | undefined,
  kinds: ElementKinds,
): PlacedGuide[] {
  const placed: PlacedGuide[] = [];
  guides.forEach(({ axis, value, frame }, index) => {
    if (!frame) {
      placed.push({ index, axis, value, frame: null, within: null, rotation: 0 });
      return;
    }
    const el = get(frame);
    if (!el) return;
    const within = kinds.kindOf(el).bounds(el);
    const rotation = el.rotation ?? 0;
    placed.push({ index, axis, value: within[axis] + value, frame, within, rotation });
  });
  return placed;
}

/**
 * The two ends of a frame's guide across its frame, turned with it (world units); `null` for a
 * page guide, which crosses the whole view.
 */
export function frameGuideEnds({
  axis,
  value,
  within,
  rotation,
}: PlacedGuide): [Point, Point] | null {
  if (!within) return null;
  const a = axis === "x" ? { x: value, y: within.y } : { x: within.x, y: value };
  const b =
    axis === "x" ? { x: value, y: within.y + within.h } : { x: within.x + within.w, y: value };
  return [rotatePoint(a, within, rotation), rotatePoint(b, within, rotation)];
}

/** A world point in a guide's frame (its unturned frame for a turned frame's guide). */
export function inGuideFrame(p: Point, { within, rotation }: PlacedGuide): Point {
  return within && rotation ? rotatePoint(p, within, -rotation) : p;
}

/** Whether a frame's guide crosses its frame (page guides always show). */
export function guideInside({ axis, value, within }: PlacedGuide): boolean {
  if (!within) return true;
  const start = axis === "x" ? within.x : within.y;
  const size = axis === "x" ? within.w : within.h;
  return value >= start && value <= start + size;
}
