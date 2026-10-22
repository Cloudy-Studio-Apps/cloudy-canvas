import type { CanvasElement } from "./elements";
import type { ElementClip } from "./render";

/** The product hooks the scene runs on every refresh (see `CanvasProduct`). */
export interface SceneHooks {
  /** `resolveElements`: derived geometry. */
  resolve?: (elements: CanvasElement[]) => CanvasElement[];
  /** `orderKeys`: the drawing order (otherwise `zOrderKey`). */
  orderKeys?: (elements: readonly CanvasElement[]) => Map<string, string>;
  /** `clips`: what clips each element. */
  clips?: (elements: readonly CanvasElement[]) => Map<string, ElementClip>;
}
