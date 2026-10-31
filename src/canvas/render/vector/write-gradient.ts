import {
  type Gradient,
  gradientKey,
  invertAffine,
  multiplyAffine,
  sampleStops,
  sortStops,
} from "../../gradient";
import type { GradientTransform } from "../../gradient";
import type { Rect } from "../../geometry.types";
import { hexOf, num } from "./svg-format";
import type { SvgContext } from "./svg-context.types";

/** Stops an eased or OKLab gradient is sampled into: close enough to show no steps. */
const SAMPLES = 32;

/**
 * The `paint` value of a gradient laid on `box`, or `null` for what SVG has no gradient for
 * (angular, diamond), which the caller flattens.
 */
export function gradientPaint(gradient: Gradient, box: Rect, w: SvgContext): string | null {
  if (gradient.type !== "linear" && gradient.type !== "radial") return null;
  const back = invertAffine(gradient.transform);
  if (!back) return null;
  const toBox: GradientTransform = [
    [box.w, 0, box.x],
    [0, box.h, box.y],
  ];
  const [[a, c, e], [b, d, f]] = multiplyAffine(toBox, back);
  const key = `gradient|${gradientKey(gradient)}|${box.x},${box.y},${box.w},${box.h}`;
  const id = w.defs.once(key, "g", (own) => {
    const place =
      `id="${own}" gradientUnits="userSpaceOnUse" ` +
      `gradientTransform="matrix(${[a, b, c, d, e, f].map(num).join(" ")})"`;
    return gradient.type === "linear"
      ? `<linearGradient ${place} x1="0" y1="0" x2="1" y2="0">${stops(gradient)}</linearGradient>`
      : `<radialGradient ${place} cx="0.5" cy="0.5" r="0.5">${stops(gradient)}</radialGradient>`;
  });
  return `url(#${id})`;
}

function stops(gradient: Gradient): string {
  const sorted = sortStops(gradient.stops);
  const eased = sorted.some((stop) => stop.ease && stop.ease !== "linear");
  if (gradient.interpolation !== "oklab" && !eased) {
    return sorted.map((s) => stop(s.position, s.color, s.opacity)).join("");
  }
  return Array.from({ length: SAMPLES }, (_, i) => {
    const t = i / (SAMPLES - 1);
    const { r, g, b, a } = sampleStops(sorted, t, gradient.interpolation);
    const color = (Math.round(r * 255) << 16) | (Math.round(g * 255) << 8) | Math.round(b * 255);
    return stop(t, hexOf(color), a);
  }).join("");
}

function stop(offset: number, color: string, opacity: number): string {
  const faded = opacity < 1 ? ` stop-opacity="${num(opacity)}"` : "";
  return `<stop offset="${num(offset)}" stop-color="${color}"${faded}/>`;
}
