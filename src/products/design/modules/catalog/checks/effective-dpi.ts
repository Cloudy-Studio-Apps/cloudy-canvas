import type { Size } from "@canvas";

import type { ImagePaint } from "../../core";

/** Brochure pages print a world unit as a point: 72 to the inch. */
const UNITS_PER_INCH = 72;

/**
 * How many of a picture's pixels land on each printed inch of a box it paints (the lower of the
 * two axes), from its natural size and how the paint places it.
 */
export function effectiveDpi(paint: ImagePaint, box: Size, picture: Size): number {
  const turned = (paint.rotation ?? 0) % 180 !== 0;
  const pw = turned ? picture.h : picture.w;
  const ph = turned ? picture.w : picture.h;
  // World units each picture pixel covers, along x and y.
  const [ux, uy] = unitsPerPixel(paint, box, pw, ph);
  return UNITS_PER_INCH / Math.max(ux, uy);
}

function unitsPerPixel(paint: ImagePaint, box: Size, pw: number, ph: number): [number, number] {
  switch (paint.scaleMode) {
    case "fill": {
      const scale = Math.max(box.w / pw, box.h / ph);
      return [scale, scale];
    }
    case "fit": {
      const scale = Math.min(box.w / pw, box.h / ph);
      return [scale, scale];
    }
    case "tile": {
      const scale = paint.scalingFactor ?? 0.5;
      return [scale, scale];
    }
    case "crop": {
      // The transform maps the box's normalized space to the picture's: its columns are how much
      // of the picture one box width (or height) shows.
      const [[a, b] = [1, 0], [d, e] = [0, 1]] = paint.transform ?? [];
      return [box.w / Math.hypot(a * pw, d * ph), box.h / Math.hypot(b * pw, e * ph)];
    }
  }
}
