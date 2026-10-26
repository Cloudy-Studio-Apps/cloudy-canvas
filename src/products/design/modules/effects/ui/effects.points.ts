import { definePoint } from "@shared/core";

import type { EffectTypeEntry } from "./effects.points.types";

/**
 * The types of effect in the Effects section (its "+" menu, rows and editors), keyed by type: the
 * built-ins and plugins' (written with `defineEffectType`).
 */
export const designEffectTypes = definePoint<EffectTypeEntry>("design.effectTypes", {
  keyOf: (entry) => entry.type,
});
