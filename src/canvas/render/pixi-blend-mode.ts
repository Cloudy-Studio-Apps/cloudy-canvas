import type { BLEND_MODES } from "pixi.js";

import type { BlendMode } from "../effects";

/**
 * Pixi's blend mode for one of ours, for paints (layers composite with the composite shader
 * instead). Pixi has no hue mode, so hue paints draw normally.
 */
const PIXI_BLEND_MODES: Record<BlendMode, BLEND_MODES> = {
  normal: "normal",
  darken: "darken",
  multiply: "multiply",
  "plus-darker": "linear-burn",
  "color-burn": "color-burn",
  lighten: "lighten",
  screen: "screen",
  "plus-lighter": "add",
  "color-dodge": "color-dodge",
  overlay: "overlay",
  "soft-light": "soft-light",
  "hard-light": "hard-light",
  difference: "difference",
  exclusion: "exclusion",
  hue: "normal",
  saturation: "saturation",
  color: "color",
  luminosity: "luminosity",
};

export function pixiBlendMode(mode: BlendMode | undefined): BLEND_MODES {
  return mode ? PIXI_BLEND_MODES[mode] : "normal";
}
