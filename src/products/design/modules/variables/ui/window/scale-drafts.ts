import {
  DEFAULT_SCALE_SETTINGS,
  numberScale,
  resolveVariable,
  tokenGroupOf,
  type ScaleInput,
  type ScaleRecord,
  type ScaleStep,
  type TokenStore,
} from "@canvas";

import { numberKindOf } from "./group-kinds";

/** A scale draft around a number variable (in its group, its scopes kept). */
export function scaleFromVariable(store: TokenStore, variableId: string): ScaleInput | null {
  const variable = store.variable(variableId);
  if (!variable) return null;
  const value = resolveVariable(store, variable.id, {});
  return {
    ...DEFAULT_SCALE_SETTINGS,
    collectionId: variable.collectionId,
    group: tokenGroupOf(variable.name),
    baseVar: variable.id,
    baseValue: value?.type === "number" ? value.number : 16,
    scopes: numberKindOf(variable).scopes,
  };
}

/** A draft for a new scale from a number (a fresh group). */
export function scaleFromNumber(
  collectionId: string,
  group: string,
  scopes: ScaleInput["scopes"],
  base = 16,
): ScaleInput {
  return { ...DEFAULT_SCALE_SETTINGS, collectionId, group, baseVar: null, baseValue: base, scopes };
}

/** A draft that edits a saved scale. */
export function scaleFromRecord(scale: ScaleRecord): ScaleInput {
  return {
    id: scale.id,
    collectionId: scale.collectionId,
    group: scale.group,
    baseVar: scale.baseVar,
    baseValue: scale.baseValue,
    scopes: scale.scopes,
    ratio: scale.ratio,
    below: scale.below,
    above: scale.above,
    names: scale.names,
    round: scale.round,
  };
}

/** The draft's base now (its base variable's, else its own). */
export function scaleDraftBase(store: TokenStore, draft: ScaleInput): number {
  if (!draft.baseVar) return draft.baseValue;
  const value = resolveVariable(store, draft.baseVar, {});
  return value?.type === "number" ? value.number : draft.baseValue;
}

/** The draft's steps. */
export function scaleDraftSteps(store: TokenStore, draft: ScaleInput): ScaleStep[] {
  return numberScale(scaleDraftBase(store, draft), draft);
}
