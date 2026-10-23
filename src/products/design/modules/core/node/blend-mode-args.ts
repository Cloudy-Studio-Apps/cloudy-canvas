import { BLEND_MODES, isBlendMode, type BlendMode } from "@canvas";

import type { LayerBlendMode } from "./design-node.types";
import type { Paint } from "./paint.types";

/** A layer's blend modes, as agents and the panel name them (pass-through first, the default). */
export const LAYER_BLEND_MODES: readonly LayerBlendMode[] = ["pass-through", ...BLEND_MODES];

/** An agent's layer blend mode, checked. */
export function layerBlendMode(value: unknown, field = "blendMode"): LayerBlendMode {
  if (value === "pass-through" || isBlendMode(value)) return value;
  throw new Error(`"${field}" must be one of ${LAYER_BLEND_MODES.join(", ")}.`);
}

/** An agent's paint blend mode, checked; normal is left out (it's the default). */
export function paintBlendMode(value: unknown, field: string): { blendMode?: BlendMode } {
  if (value === undefined) return {};
  if (!isBlendMode(value)) throw new Error(`"${field}" must be one of ${BLEND_MODES.join(", ")}.`);
  return value === "normal" ? {} : { blendMode: value };
}

/** `paint` blending with `mode`; normal is stored as no blend mode at all. */
export function withBlendMode<P extends Paint>(paint: P, mode: BlendMode | undefined): P {
  const next = { ...paint };
  if (mode && mode !== "normal") next.blendMode = mode;
  else delete next.blendMode;
  return next;
}
