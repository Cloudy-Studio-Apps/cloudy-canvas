import type { CanvasEffect } from "../../effects";
import type { EffectRenderers } from "./effect-renderer.types";

/**
 * How far past what they're applied to a list of effects shows, in world units (exports and
 * culling grow bounds by it): each renderer's outset, in pipeline order.
 */
export function effectsOutset(
  effects: readonly CanvasEffect[],
  renderers: EffectRenderers,
): number {
  let outset = 0;
  for (const stage of ["backdrop", "content", "behind", "filter"] as const) {
    for (const effect of effects) {
      const renderer = renderers.get(effect.type);
      if (effect.visible && renderer?.stage === stage) outset = renderer.outset(effect, outset);
    }
  }
  return outset;
}
