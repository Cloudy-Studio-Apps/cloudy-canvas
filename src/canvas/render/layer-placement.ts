import { zOrderKey } from "../elements";
import type {
  ElementEffects,
  ElementMasks,
  LayerPlacement,
  ScopeSlot,
} from "./layer-placement.types";

/** No masks at all. */
export const NO_MASKS: ElementMasks = { masks: new Map(), homes: new Map() };

/** No effects at all. */
export const NO_EFFECTS: ElementEffects = { scopes: new Map(), homes: new Map() };

/** The innermost scope an element is drawn in: its effect slot, else its mask slot. */
export function homeOf(id: string, masks: ElementMasks, effects: ElementEffects): ScopeSlot | null {
  return effects.homes.get(id) ?? masks.homes.get(id) ?? null;
}

/** The home of a scope: of a mask's, or of an element's effects. */
export function scopeHome(
  slot: ScopeSlot,
  masks: ElementMasks,
  effects: ElementEffects,
): ScopeSlot | null {
  return "mask" in slot
    ? (masks.masks.get(slot.mask)?.home ?? null)
    : (effects.scopes.get(slot.effect)?.home ?? null);
}

/** Whether two slots are the same. */
export function sameSlot(
  a: ScopeSlot | null | undefined,
  b: ScopeSlot | null | undefined,
): boolean {
  if (!a || !b) return !a && !b;
  if ("mask" in a) return "mask" in b && a.mask === b.mask && a.role === b.role;
  return "effect" in b && a.effect === b.effect;
}

/** Stacking by `zOrderKey`, no clips or masks: layers that don't follow a scene (e.g. previews). */
export const DEFAULT_PLACEMENT: LayerPlacement = {
  orderOf: zOrderKey,
  clipOf: () => null,
  masks: () => NO_MASKS,
  effects: () => NO_EFFECTS,
  effectRenderers: new Map(),
  drawn: () => true,
};
