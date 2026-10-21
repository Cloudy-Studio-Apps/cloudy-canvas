import { getStroke } from "perfect-freehand";

import { STROKE_DEFAULTS } from "./stroke.defaults";
import type { StrokePen } from "./stroke.types";

/** Converts a flat point list into a filled outline polygon (flat list) for a stroke. */
export function strokeOutline(
  points: number[],
  size: number,
  complete: boolean,
  pen: StrokePen = STROKE_DEFAULTS.pen,
): number[] {
  const input: [number, number][] = [];
  for (let i = 0; i + 1 < points.length; i += 2) input.push([points[i]!, points[i + 1]!]);
  const look = STROKE_DEFAULTS.pens[pen];
  const outline = getStroke(input, {
    size,
    thinning: look.thinning,
    smoothing: look.smoothing,
    streamline: look.streamline,
    simulatePressure: false,
    start: { cap: look.caps },
    end: { cap: look.caps },
    last: complete,
  });
  return outline.flat();
}
