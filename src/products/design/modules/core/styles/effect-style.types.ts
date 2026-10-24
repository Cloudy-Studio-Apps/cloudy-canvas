import type { NodeEffect } from "../node/design-node.types";

/** What an effect style holds: an effects stack, bottom to top. */
export interface EffectStyleValue {
  effects: NodeEffect[];
}
