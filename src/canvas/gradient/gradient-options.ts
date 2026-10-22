import type { ColorStop, Gradient, GradientInterpolation, StopEase } from "./gradient.types";

/** The gradient mixing its stops as `interpolation` says (`srgb`, the default, isn't stored). */
export function withInterpolation<G extends Gradient>(
  gradient: G,
  interpolation: GradientInterpolation | undefined,
): G {
  const next = { ...gradient };
  if (!interpolation || interpolation === "srgb") delete next.interpolation;
  else next.interpolation = interpolation;
  return next;
}

/** The stop blending to the next one as `ease` says (`linear`, the default, isn't stored). */
export function withEase(stop: ColorStop, ease: StopEase | undefined): ColorStop {
  const next = { ...stop };
  if (!ease || ease === "linear") delete next.ease;
  else next.ease = ease;
  return next;
}
