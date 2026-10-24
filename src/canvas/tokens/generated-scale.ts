import { DEFAULT_VALUE } from "./default-value";
import { numberScale } from "./number-scale";
import { resolveVariable } from "./resolve-token";
import type { ScaleRecord } from "./scale-generator.types";
import type { TokenStore } from "./token-store";
import type { VariableRecord } from "./token.types";

/** A scale's base number now: its base variable's default (aliases followed), or its own. */
export function scaleBase(store: TokenStore, scale: ScaleRecord): number | null {
  if (!scale.baseVar) return scale.baseValue;
  const value = resolveVariable(store, scale.baseVar, {});
  return value?.type === "number" ? value.number : null;
}

/**
 * The variables a scale writes: its steps named `group/step`, updating those already there (its
 * own, or hand-made ones it takes over) and making the rest with `make`; never its base variable
 * or another generator's.
 */
export function generatedScale(
  store: TokenStore,
  scale: ScaleRecord,
  make: (name: string) => VariableRecord,
): VariableRecord[] {
  const base = scaleBase(store, scale);
  if (base === null) return [];
  const out: VariableRecord[] = [];
  for (const step of numberScale(base, scale)) {
    const name = scale.group ? `${scale.group}/${step.name}` : step.name;
    const existing = store.byPath(scale.collectionId, name);
    if (existing?.id === scale.baseVar) continue;
    if (existing?.generatorId && existing.generatorId !== scale.id) continue;
    const record = existing ?? make(name);
    out.push({
      ...record,
      type: "number",
      values: { [DEFAULT_VALUE]: { number: step.value } },
      axisId: null,
      scopes: scale.scopes,
      generatorId: scale.id,
    });
  }
  return out;
}
