import { getStroke, getStrokePoints, type StrokeOptions } from "perfect-freehand";

import { STROKE_DEFAULTS } from "./stroke.defaults";
import type { StrokePen } from "./stroke.types";

/** The flat point list as the pairs perfect-freehand reads. */
function pairsOf(points: number[]): [number, number][] {
  const pairs: [number, number][] = [];
  for (let i = 0; i + 1 < points.length; i += 2) pairs.push([points[i]!, points[i + 1]!]);
  return pairs;
}

function optionsFor(size: number, complete: boolean, pen: StrokePen): StrokeOptions {
  const look = STROKE_DEFAULTS.pens[pen];
  return {
    size,
    thinning: look.thinning,
    smoothing: look.smoothing,
    streamline: look.streamline,
    simulatePressure: false,
    start: { cap: look.caps },
    end: { cap: look.caps },
    last: complete,
  };
}

/** Converts a flat point list into a filled outline polygon (flat list) for a stroke. */
export function strokeOutline(
  points: number[],
  size: number,
  complete: boolean,
  pen: StrokePen = STROKE_DEFAULTS.pen,
): number[] {
  return getStroke(pairsOf(points), optionsFor(size, complete, pen)).flat();
}

/**
 * The steadied line down the middle of a stroke (flat list), the path its outline goes around.
 * With no pressure to read the stroke's width doesn't change, so this drawn thick looks the same,
 * and unlike an outline it can't cross itself on a sharp turn, which fills in as a solid shape.
 */
export function strokeCenterLine(
  points: number[],
  size: number,
  complete: boolean,
  pen: StrokePen = STROKE_DEFAULTS.pen,
): number[] {
  const line = getStrokePoints(pairsOf(points), optionsFor(size, complete, pen));
  return line.flatMap(({ point }) => [point[0]!, point[1]!]);
}
