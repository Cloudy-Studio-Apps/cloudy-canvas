import { createId } from "@shared/core";

import { EFFECT_DEFAULTS } from "./effect.defaults";
import type { DesignEffect, DesignEffectType } from "./effect.types";

/** A new visible effect of a type, with its defaults. */
export function createEffect<T extends DesignEffectType>(
  type: T,
): Extract<DesignEffect, { type: T }> {
  return {
    id: createId(),
    type,
    visible: true,
    ...structuredClone(EFFECT_DEFAULTS[type]),
  } as unknown as Extract<DesignEffect, { type: T }>;
}
