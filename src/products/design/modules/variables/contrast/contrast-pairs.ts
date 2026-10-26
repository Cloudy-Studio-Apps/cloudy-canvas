import {
  resolveVariable,
  type ModeAxisRecord,
  type TokenStore,
  type VariableRecord,
} from "@canvas";

import { contrastGrade, contrastRatio, GRADE_ORDER } from "./contrast-math";
import type { ContrastCheck, ContrastPair, ContrastResult } from "./contrast.types";

/** At most this many mode combinations per pair (axes combine). */
const MAX_COMBINATIONS = 16;

const isText = (v: VariableRecord) => v.scopes.includes("text-fill");
const isSurface = (v: VariableRecord) =>
  v.scopes.includes("frame-fill") || v.scopes.includes("shape-fill");

/**
 * The pairs to check: those declared on a variable (`contrastWith`: it's the text, the partner the
 * surface), then text-fill colors × frame and shape fill colors of the same collection, for the
 * text colors that declare none.
 */
export function contrastPairs(store: TokenStore): ContrastPair[] {
  const colors = store.variables().filter((v) => v.type === "color");
  const pairs = new Map<string, ContrastPair>();
  for (const variable of colors) {
    for (const partner of variable.contrastWith ?? []) {
      if (store.variable(partner)?.type !== "color") continue;
      pairs.set(`${variable.id}|${partner}`, {
        text: variable.id,
        surface: partner,
        declared: true,
      });
    }
  }
  // A text color with declared pairs is read only on those (white button text isn't page text).
  for (const text of colors.filter((v) => isText(v) && !v.contrastWith?.length)) {
    for (const surface of colors.filter(isSurface)) {
      if (surface.collectionId !== text.collectionId || surface.id === text.id) continue;
      const key = `${text.id}|${surface.id}`;
      if (!pairs.has(key)) pairs.set(key, { text: text.id, surface: surface.id, declared: false });
    }
  }
  return [...pairs.values()];
}

/** Every combination of the modes of these axes (the file's current mode when there are none). */
function modeCombinations(
  axes: readonly ModeAxisRecord[],
): { modes: Record<string, string>; label: string }[] {
  let combos: { modes: Record<string, string>; label: string[] }[] = [{ modes: {}, label: [] }];
  for (const axis of axes) {
    combos = combos.flatMap((combo) =>
      axis.modes.map((mode) => ({
        modes: { ...combo.modes, [axis.id]: mode.id },
        label: [...combo.label, mode.name],
      })),
    );
    if (combos.length > MAX_COMBINATIONS) combos = combos.slice(0, MAX_COMBINATIONS);
  }
  return combos.map((combo) => ({ modes: combo.modes, label: combo.label.join(" · ") }));
}

/** The axes a variable's value depends on: its own and those of what it aliases. */
function axesOf(store: TokenStore, id: string, seen = new Set<string>()): Set<string> {
  const variable = store.variable(id);
  if (!variable || seen.has(id)) return new Set();
  seen.add(id);
  const axes = new Set<string>(variable.axisId ? [variable.axisId] : []);
  for (const value of Object.values(variable.values)) {
    if ("alias" in value) for (const axis of axesOf(store, value.alias, seen)) axes.add(axis);
  }
  return axes;
}

/**
 * Each pair checked in every mode its two colors vary by (aliases followed), failing pairs first.
 * A pair whose colors can't be resolved is left out.
 */
export function contrastChecks(store: TokenStore, pairs = contrastPairs(store)): ContrastCheck[] {
  const checks: ContrastCheck[] = [];
  for (const pair of pairs) {
    const axisIds = new Set([...axesOf(store, pair.text), ...axesOf(store, pair.surface)]);
    const axes = store.axes().filter((axis) => axisIds.has(axis.id) && axis.modes.length > 1);
    const results: ContrastResult[] = [];
    for (const combo of modeCombinations(axes)) {
      const text = resolveVariable(store, pair.text, combo.modes);
      const surface = resolveVariable(store, pair.surface, combo.modes);
      if (text?.type !== "color" || surface?.type !== "color") continue;
      const ratio = contrastRatio(text.color, surface.color);
      results.push({ ...combo, ratio, grade: contrastGrade(ratio) });
    }
    if (results.length === 0) continue;
    const worst = results.reduce(
      (low, r) => (GRADE_ORDER.indexOf(r.grade) < GRADE_ORDER.indexOf(low) ? r.grade : low),
      results[0]!.grade,
    );
    checks.push({ ...pair, results, worst });
  }
  return checks.sort((a, b) => GRADE_ORDER.indexOf(a.worst) - GRADE_ORDER.indexOf(b.worst));
}
