import { DEFAULT_SHADE_SETTINGS, shadeRamp } from "@canvas";

import type { WizardShade } from "./theme.types";

/** A color's 50–950 shades, as the variables' shade generator makes them (the color at 500). */
export function shadesOf(hex: string): WizardShade[] {
  return shadeRamp(`${hex}FF`, DEFAULT_SHADE_SETTINGS).map((s) => ({
    stop: Number(s.name),
    hex: s.color.slice(0, 7),
    anchor: s.anchor,
  }));
}

/** One shade of a color (the color itself for a step it doesn't have). */
export function shadeOf(hex: string, stop: number): string {
  return shadesOf(hex).find((s) => s.stop === stop)?.hex ?? hex;
}
