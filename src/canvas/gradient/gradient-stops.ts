import { hexToRgba, oklabToSrgb, rgbaToHex, srgbToOklab } from "./gradient-color";
import type { Rgba } from "./gradient-color.types";
import type { ColorStop, GradientInterpolation, StopEase } from "./gradient.types";

/** The fewest stops a gradient has. */
export const MIN_STOPS = 2;

/** The stops ordered by position (stable, so stops on one position keep their order). */
export function sortStops<S extends ColorStop>(stops: readonly S[]): S[] {
  return [...stops].sort((a, b) => a.position - b.position);
}

/** `u` (0–1 between two stops) eased. */
export function easeStop(ease: StopEase | undefined, u: number): number {
  switch (ease) {
    case "ease-in":
      return u * u;
    case "ease-out":
      return 1 - (1 - u) * (1 - u);
    case "ease-in-out":
      return u < 0.5 ? 2 * u * u : 1 - 2 * (1 - u) * (1 - u);
    default:
      return u;
  }
}

/**
 * The color at `t` (0–1) of stops already sorted: the nearest stop's beyond the ends, otherwise
 * the two around it blended (premultiplied, so a fade to transparent keeps its color) in sRGB or
 * OKLab, eased as the lower stop says.
 */
export function sampleStops(
  sorted: readonly ColorStop[],
  t: number,
  interpolation: GradientInterpolation = "srgb",
): Rgba {
  const first = sorted[0];
  const last = sorted[sorted.length - 1];
  if (!first || !last) return { r: 0, g: 0, b: 0, a: 0 };
  if (t <= first.position) return hexToRgba(first.color, first.opacity);
  if (t >= last.position) return hexToRgba(last.color, last.opacity);
  let i = 0;
  while (i < sorted.length - 2 && sorted[i + 1]!.position < t) i++;
  const from = sorted[i]!;
  const to = sorted[i + 1]!;
  const span = to.position - from.position;
  const u = easeStop(from.ease, span > 0 ? (t - from.position) / span : 1);
  return mixColors(
    hexToRgba(from.color, from.opacity),
    hexToRgba(to.color, to.opacity),
    u,
    interpolation,
  );
}

/** `a` and `b` blended by `u`, premultiplied by their alphas. */
export function mixColors(a: Rgba, b: Rgba, u: number, interpolation: GradientInterpolation): Rgba {
  const alpha = a.a + (b.a - a.a) * u;
  if (alpha <= 0) return { r: 0, g: 0, b: 0, a: 0 };
  const mix = (x: number, y: number) => (x * a.a * (1 - u) + y * b.a * u) / alpha;
  if (interpolation === "oklab") {
    const la = srgbToOklab(a);
    const lb = srgbToOklab(b);
    return oklabToSrgb([mix(la[0], lb[0]), mix(la[1], lb[1]), mix(la[2], lb[2])], alpha);
  }
  return { r: mix(a.r, b.r), g: mix(a.g, b.g), b: mix(a.b, b.b), a: alpha };
}

/** A new stop at `position`, colored as the gradient is there; the stops come back sorted. */
export function addStop(
  stops: readonly ColorStop[],
  position: number,
  interpolation?: GradientInterpolation,
): { stops: ColorStop[]; index: number } {
  const sorted = sortStops(stops);
  const color = sampleStops(sorted, position, interpolation);
  const stop: ColorStop = {
    position: Math.round(position * 1000) / 1000,
    color: rgbaToHex(color),
    opacity: Math.round(color.a * 100) / 100,
  };
  const index = sorted.findIndex((s) => s.position > position);
  const at = index === -1 ? sorted.length : index;
  sorted.splice(at, 0, stop);
  return { stops: sorted, index: at };
}

/** The stops without the one at `index`, unless that would leave fewer than `MIN_STOPS`. */
export function removeStop(stops: readonly ColorStop[], index: number): ColorStop[] {
  if (stops.length <= MIN_STOPS) return [...stops];
  return stops.filter((_, i) => i !== index);
}

const REVERSED_EASE: Record<StopEase, StopEase> = {
  linear: "linear",
  "ease-in": "ease-out",
  "ease-out": "ease-in",
  "ease-in-out": "ease-in-out",
};

/** The stops the other way round (each blend keeps its curve, mirrored). */
export function reverseStops(stops: readonly ColorStop[]): ColorStop[] {
  const sorted = sortStops(stops);
  return sorted
    .map((stop, i) => {
      // The blend that ended at this stop now starts from it.
      const ease = i > 0 ? sorted[i - 1]!.ease : undefined;
      const reversed: ColorStop = {
        position: Math.round((1 - stop.position) * 1000) / 1000,
        color: stop.color,
        opacity: stop.opacity,
      };
      if (ease && ease !== "linear") reversed.ease = REVERSED_EASE[ease];
      return reversed;
    })
    .reverse();
}
