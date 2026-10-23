import type { BlendMode } from "./blend-mode.types";

/** Every blend mode, in Figma's menu order (the composite shader numbers them so too). */
export const BLEND_MODES: readonly BlendMode[] = [
  "normal",
  "darken",
  "multiply",
  "plus-darker",
  "color-burn",
  "lighten",
  "screen",
  "plus-lighter",
  "color-dodge",
  "overlay",
  "soft-light",
  "hard-light",
  "difference",
  "exclusion",
  "hue",
  "saturation",
  "color",
  "luminosity",
];

const KNOWN = new Set<string>(BLEND_MODES);

/** Whether a value is one of the blend modes. */
export function isBlendMode(value: unknown): value is BlendMode {
  return typeof value === "string" && KNOWN.has(value);
}
