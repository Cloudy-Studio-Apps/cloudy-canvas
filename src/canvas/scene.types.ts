import type { CanvasElement } from "./elements";
import type { CanvasEffect } from "./effects";
import type { ElementClip, ElementEffects, ElementMasks } from "./render";

/** The product hooks the scene runs on every refresh (see `CanvasProduct`). */
export interface SceneHooks {
  /** `scopes.of`: the scope each element shows in (without it, every element is shown). */
  scopeOf?: (el: CanvasElement) => string | null;
  /** `resolveElements`: derived geometry. */
  resolve?: (elements: CanvasElement[]) => CanvasElement[];
  /** `orderKeys`: the drawing order (otherwise `zOrderKey`). */
  orderKeys?: (elements: readonly CanvasElement[]) => Map<string, string>;
  /** `clips`: what clips each element. */
  clips?: (elements: readonly CanvasElement[]) => Map<string, ElementClip>;
  /** `masks`: what masks each element. */
  masks?: (elements: readonly CanvasElement[]) => ElementMasks;
  /** `effects`: each element's effects, and what they're drawn over. */
  effects?: (elements: readonly CanvasElement[]) => ElementEffects;
  /** How far a list of effects shows past what it's applied to, in world units. */
  effectsOutset?: (effects: readonly CanvasEffect[]) => number;
  /** `undrawn`: elements not drawn on their own. */
  undrawn?: (elements: readonly CanvasElement[]) => ReadonlySet<string>;
}
