import {
  DEFAULT_SHADE_SETTINGS,
  resolveVariable,
  shadeRamp,
  tokenGroupOf,
  tokenLeafOf,
  type GeneratorInput,
  type GeneratorRecord,
  type Shade,
  type TokenStore,
} from "@canvas";

import type { BoardMode } from "./board-model.types";

/** A generator draft for the shades of a variable (in its group when it's a step, else its own). */
export function draftFromVariable(store: TokenStore, variableId: string): GeneratorInput | null {
  const variable = store.variable(variableId);
  if (!variable) return null;
  const value = resolveVariable(store, variable.id, {});
  const leaf = tokenLeafOf(variable.name);
  const parent = tokenGroupOf(variable.name);
  return {
    ...DEFAULT_SHADE_SETTINGS,
    collectionId: variable.collectionId,
    group: /^\d+$/.test(leaf) ? parent : parent ? `${parent}/${leaf}` : leaf,
    baseVar: variable.id,
    baseColor: value?.type === "color" ? value.color : "#3A83C9FF",
  };
}

/** A draft for new shades from a color (a fresh group of the collection). */
export function draftFromColor(
  collectionId: string,
  group: string,
  color = "#3A83C9FF",
): GeneratorInput {
  return { ...DEFAULT_SHADE_SETTINGS, collectionId, group, baseVar: null, baseColor: color };
}

/** A draft that edits a saved generator. */
export function draftFromGenerator(generator: GeneratorRecord): GeneratorInput {
  return {
    id: generator.id,
    collectionId: generator.collectionId,
    group: generator.group,
    baseVar: generator.baseVar,
    baseColor: generator.baseColor,
    axisId: generator.axisId,
    steps: generator.steps,
    lightest: generator.lightest,
    darkest: generator.darkest,
    fade: generator.fade,
    other: generator.other,
  };
}

/** The draft's base color now (its base variable's, else its own). */
export function draftBase(store: TokenStore, draft: GeneratorInput): string {
  if (!draft.baseVar) return draft.baseColor;
  const value = resolveVariable(store, draft.baseVar, {});
  return value?.type === "color" ? value.color : draft.baseColor;
}

/** The draft's shades, and each shade's color in each mode (flipped in the later modes). */
export function draftShades(
  store: TokenStore,
  draft: GeneratorInput,
  modes: readonly BoardMode[],
  allModes: readonly BoardMode[],
): { shades: Shade[]; colors: string[][] } {
  const shades = shadeRamp(draftBase(store, draft), draft);
  const colors = shades.map((shade, i) =>
    modes.map((mode) => {
      const later = allModes.findIndex((m) => m.id === mode.id) > 0;
      const mirror = shades[shades.length - 1 - i];
      return later && draft.other === "flip" && mirror ? mirror.color : shade.color;
    }),
  );
  return { shades, colors };
}
