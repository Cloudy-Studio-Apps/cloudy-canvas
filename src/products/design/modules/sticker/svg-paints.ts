import { transformFromHandles, type Point, type Rect, type SvgPaint } from "@canvas";

import { solidPaint, type Paint } from "../core";

/**
 * An SVG layer's paint as a design paint of a layer whose box is `box` (world units); `place`
 * takes a point of the SVG's user space to the world, so gradients keep their place.
 */
export function svgPaint(paint: SvgPaint, box: Rect, place: (p: Point) => Point): Paint {
  if (paint.kind === "color") return solidPaint(paint.color, paint.opacity);
  const { gradient } = paint;
  const normalized = (p: Point): Point => {
    const world = place(p);
    return {
      x: (world.x - box.x) / Math.max(box.w, 1e-6),
      y: (world.y - box.y) / Math.max(box.h, 1e-6),
    };
  };
  const handles = {
    start: normalized(gradient.start),
    end: normalized(gradient.end),
    width: normalized(gradient.width),
  };
  return {
    type: gradient.type,
    stops: gradient.stops,
    transform: transformFromHandles(gradient.type, handles, { w: box.w, h: box.h }),
    opacity: paint.opacity,
    visible: true,
  };
}
