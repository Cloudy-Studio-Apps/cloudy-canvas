import { DEFAULT_VALUE } from "./default-value";
import { numberScale } from "./number-scale";
import { resolveVariable } from "./resolve-token";
import type { GeneratedScale, ScaleRecord } from "./scale-generator.types";
import type { TokenStore } from "./token-store";
import type { TokenValue, VariableRecord } from "./token.types";

/** A scale's base number now: its base variable's default (aliases followed), or its own. */
export function scaleBase(store: TokenStore, scale: ScaleRecord): number | null {
  if (!scale.baseVar) return scale.baseValue;
  const value = resolveVariable(store, scale.baseVar, {});
  return value?.type === "number" ? value.number : null;
}

/**
 * The variables a scale writes: its steps named `group/step`, updating those already there (its
 * own, or hand-made ones it takes over) and making the rest with `make`; never its base variable
 * or another generator's. Every step but the base is an expression of the base
 * (`round({base} * 1.5625)`), so editing the base moves them all, in every mode, at once. A scale
 * with a base variable makes its base step an alias of it; one with only a number writes it into
 * the base step, which becomes its base (`baseId`).
 */
export function generatedScale(
  store: TokenStore,
  scale: ScaleRecord,
  make: (name: string) => VariableRecord,
): GeneratedScale {
  const base = scaleBase(store, scale);
  if (base === null) return { variables: [], baseId: scale.baseVar };
  // Made in step order, so new steps sit in the collection smallest first.
  const steps = numberScale(base, scale).map((step) => {
    const name = scale.group ? `${scale.group}/${step.name}` : step.name;
    const existing = store.byPath(scale.collectionId, name);
    return { step, existing, record: existing ?? make(name) };
  });
  const baseId = scale.baseVar ?? steps.find(({ step }) => step.base)?.record.id ?? null;
  if (!baseId) return { variables: [], baseId: null };
  const out: VariableRecord[] = [];
  for (const { step, existing, record } of steps) {
    if (existing?.id === scale.baseVar) continue;
    if (existing?.generatorId && existing.generatorId !== scale.id) continue;
    const value: TokenValue = step.base
      ? scale.baseVar
        ? { alias: scale.baseVar }
        : { number: step.value }
      : { expr: stepExpression(baseId, step.factor, scale.round) };
    out.push({
      ...record,
      type: "number",
      values: { [DEFAULT_VALUE]: value },
      axisId: null,
      scopes: scale.scopes,
      generatorId: scale.id,
    });
  }
  return { variables: out, baseId };
}

/** A step worked out from its base: rounded to a whole number, or to two decimals. */
function stepExpression(baseId: string, factor: number, round: boolean): string {
  const times = String(Number(factor.toFixed(6)));
  return round ? `round({${baseId}} * ${times})` : `round({${baseId}} * ${times} * 100) / 100`;
}
