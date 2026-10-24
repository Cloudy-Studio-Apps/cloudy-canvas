import type { CanvasProduct } from "../canvas-product.types";
import { effectsOutset, type EffectRenderer } from "../render";
import type { SceneHooks } from "../scene.types";

/**
 * The product hooks a scene runs (scopes, derived geometry, order, clips, masks, effects), the
 * same for the user's scene and every collaborator's.
 */
export function productSceneHooks<O extends object>(product: CanvasProduct<O>): SceneHooks {
  const { scopes } = product;
  const effectRenderers = product.effectRenderers ?? new Map<string, EffectRenderer>();
  return {
    scopeOf: scopes ? (el) => scopes.of(el) : undefined,
    resolve: product.resolveElements?.bind(product),
    orderKeys: product.orderKeys?.bind(product),
    clips: product.clips?.bind(product),
    masks: product.masks?.bind(product),
    effects: product.effects?.bind(product),
    effectsOutset: (effects) => effectsOutset(effects, effectRenderers),
    undrawn: product.undrawn?.bind(product),
  };
}
