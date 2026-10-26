import { generatedScale } from "./generated-scale";
import type { TokenStore } from "./token-store";
import type { TokenRecord, VariableRecord } from "./token.types";

/**
 * What makes scales from before live scales (every step an expression of its base step): the
 * steps each scale still owns that hold plain numbers, rewritten with the same values, and a
 * scale based on a number rebased on its base step. Steps tuned by hand (no longer the scale's)
 * and deleted ones are left alone, no variable is made, and live scales give nothing.
 */
export function liveScaleRecords(store: TokenStore): TokenRecord[] {
  const out: TokenRecord[] = [];
  for (const scale of store.scales()) {
    const owned = (id: string) => store.variable(id)?.generatorId === scale.id;
    const stale = store
      .variables(scale.collectionId)
      .some((v) => v.generatorId === scale.id && v.id !== scale.baseVar && !isLive(v.values));
    if (!stale) continue;
    // A missing step stays missing: its placeholder is never written.
    const { variables, baseId } = generatedScale(store, scale, (name) => placeholder(name));
    out.push(...variables.filter((v) => owned(v.id)));
    if (!scale.baseVar && baseId && owned(baseId)) out.push({ ...scale, baseVar: baseId });
  }
  return out;
}

/** Whether a step's value is already worked out from its base (an expression or an alias). */
function isLive(values: Record<string, object>): boolean {
  return Object.values(values).every((value) => "expr" in value || "alias" in value);
}

/** A step that isn't there, as `generatedScale` asks for one (filtered out after). */
function placeholder(name: string): VariableRecord {
  return {
    kind: "variable",
    id: `missing:${name}`,
    collectionId: "",
    name,
    type: "number",
    axisId: null,
    values: {},
    scopes: [],
    description: "",
    codeSyntax: {},
    hidden: false,
    order: "",
  };
}
