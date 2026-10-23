import type { CanvasElement } from "./elements";
import type { ElementClip, ElementMasks } from "./render";

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
}
