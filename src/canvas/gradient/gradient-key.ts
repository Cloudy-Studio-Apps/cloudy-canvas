import type { Gradient } from "./gradient.types";

/** A string naming what the gradient looks like: equal gradients share one. */
export function gradientKey({ type, stops, transform, interpolation }: Gradient): string {
  return JSON.stringify([type, stops, transform, interpolation ?? "srgb"]);
}
