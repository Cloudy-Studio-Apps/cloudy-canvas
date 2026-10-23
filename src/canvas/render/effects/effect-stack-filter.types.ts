import type { CanvasEffect } from "../../effects";
import type { EffectRenderer } from "./effect-renderer.types";

/** An effect with its renderer, in the order the pipeline draws them. */
export interface EffectStep {
  effect: CanvasEffect;
  renderer: EffectRenderer;
}
