import { getStroke } from "perfect-freehand";

/** Converts a flat point list into a filled outline polygon (flat list) for a marker stroke. */
export function strokeOutline(points: number[], size: number, complete: boolean): number[] {
  const input: [number, number][] = [];
  for (let i = 0; i + 1 < points.length; i += 2) input.push([points[i]!, points[i + 1]!]);
  const outline = getStroke(input, {
    size,
    thinning: 0.15,
    smoothing: 0.6,
    streamline: 0.45,
    simulatePressure: false,
    last: complete,
  });
  return outline.flat();
}
