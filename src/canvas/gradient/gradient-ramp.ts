import { sampleStops, sortStops } from "./gradient-stops";
import type { Gradient } from "./gradient.types";

/** How many colors a ramp holds. */
export const RAMP_SIZE = 1024;

/**
 * The gradient's colors from 0 to 1 in `RAMP_SIZE` steps, as straight-alpha RGBA floats (0–1),
 * looked up instead of blending stops for every pixel.
 */
export function gradientRamp(gradient: Gradient): Float32Array {
  const sorted = sortStops(gradient.stops);
  const ramp = new Float32Array(RAMP_SIZE * 4);
  for (let i = 0; i < RAMP_SIZE; i++) {
    const { r, g, b, a } = sampleStops(sorted, i / (RAMP_SIZE - 1), gradient.interpolation);
    ramp.set([r, g, b, a], i * 4);
  }
  return ramp;
}
