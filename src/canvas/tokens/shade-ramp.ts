import { hexToOklch, oklchToHex } from "./oklab";
import type { Shade, ShadeSettings, ShadeSteps } from "./shade-generator.types";

/** The step names of each set (Tailwind's, a shorter one, five steps). */
export const SHADE_STEPS: Readonly<Record<ShadeSteps, readonly number[]>> = {
  "50-950": [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950],
  "100-900": [100, 200, 300, 400, 500, 600, 700, 800, 900],
  "5": [100, 300, 500, 700, 900],
};

/** A new generator's settings. */
export const DEFAULT_SHADE_SETTINGS: ShadeSettings = {
  steps: "50-950",
  lightest: 0.97,
  darkest: 0.24,
  fade: 0.45,
  other: "flip",
};

/**
 * The shades of a color: lightness spread evenly from the lightest to the base (at 500) and on to
 * the darkest, its hue kept and its chroma softened toward the ends, in OKLab so the steps look
 * even.
 */
export function shadeRamp(base: string, settings: ShadeSettings): Shade[] {
  const steps = SHADE_STEPS[settings.steps];
  const anchor = steps.indexOf(500);
  const { L, C, H } = hexToOklch(base);
  const reach = Math.max(anchor, steps.length - 1 - anchor);
  return steps.map((step, i) => {
    if (i === anchor) return { name: String(step), color: `${base.slice(0, 7)}FF`, anchor: true };
    const lightness =
      i < anchor
        ? settings.lightest + (L - settings.lightest) * (i / anchor)
        : L + (settings.darkest - L) * ((i - anchor) / (steps.length - 1 - anchor));
    const chroma = C * (1 - settings.fade * (Math.abs(i - anchor) / reach) ** 1.4);
    return { name: String(step), color: oklchToHex({ L: lightness, C: chroma, H }), anchor: false };
  });
}
