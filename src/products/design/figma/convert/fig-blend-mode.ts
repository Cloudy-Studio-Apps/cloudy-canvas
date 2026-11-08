import type { BlendMode } from "@canvas";

import type { LayerBlendMode } from "../../modules";
import type { FigmaContext } from "../figma-warning.types";

/** Figma's blend modes by name (its linear burn and dodge are "plus darker" and "plus lighter"). */
const BLEND_MODES: Record<string, BlendMode> = {
  NORMAL: "normal",
  DARKEN: "darken",
  MULTIPLY: "multiply",
  LINEAR_BURN: "plus-darker",
  COLOR_BURN: "color-burn",
  LIGHTEN: "lighten",
  SCREEN: "screen",
  LINEAR_DODGE: "plus-lighter",
  COLOR_DODGE: "color-dodge",
  OVERLAY: "overlay",
  SOFT_LIGHT: "soft-light",
  HARD_LIGHT: "hard-light",
  DIFFERENCE: "difference",
  EXCLUSION: "exclusion",
  HUE: "hue",
  SATURATION: "saturation",
  COLOR: "color",
  LUMINOSITY: "luminosity",
};

/** A layer's blend mode (pass-through when the file has none; unknown ones too, counted). */
export function figLayerBlendMode(name: string | undefined, ctx: FigmaContext): LayerBlendMode {
  if (name === undefined || name === "PASS_THROUGH") return "pass-through";
  return figBlendMode(name, ctx) ?? "pass-through";
}

/** A paint's blend mode, left out when it's normal (unknown ones too, counted). */
export function figPaintBlendMode(
  name: string | undefined,
  ctx: FigmaContext,
): { blendMode?: BlendMode } {
  const mode = name === undefined ? undefined : figBlendMode(name, ctx);
  return mode && mode !== "normal" ? { blendMode: mode } : {};
}

function figBlendMode(name: string, ctx: FigmaContext): BlendMode | undefined {
  const mode = BLEND_MODES[name];
  if (!mode) ctx.warnings.add("blendMode");
  return mode;
}
