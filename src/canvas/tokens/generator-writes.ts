import { generateKeyBetween } from "fractional-indexing";

import { createId } from "@shared/core";

import type { CanvasDocument } from "../document";
import { generatedScale, scaleBase } from "./generated-scale";
import { generatedShades, generatorBase } from "./generated-shades";
import type { ScaleRecord } from "./scale-generator.types";
import type { GeneratorRecord } from "./shade-generator.types";
import { TokenStore } from "./token-store";
import type { TokenRecord, VariableRecord, VariableType } from "./token.types";

/** Makes new variables for a generator, ordered after the collection's last one. */
function maker(store: TokenStore, collectionId: string, type: VariableType) {
  let last = store.variables(collectionId).at(-1)?.order ?? null;
  return (name: string): VariableRecord => {
    last = generateKeyBetween(last, null);
    return {
      kind: "variable",
      id: createId(),
      collectionId,
      name,
      type,
      axisId: null,
      values: {},
      scopes: [],
      description: "",
      codeSyntax: {},
      hidden: false,
      order: last,
    };
  };
}

/** Writes a shade generator's or a scale's variables (inside the edit running now). */
export function regenerate(doc: CanvasDocument, record: GeneratorRecord | ScaleRecord): void {
  const store = TokenStore.of(doc);
  const made =
    record.kind === "generator"
      ? generatedShades(store, record, maker(store, record.collectionId, "color"))
      : generatedScale(store, record, maker(store, record.collectionId, "number"));
  if (made.length > 0) doc.setTokenRecords(made);
}

/** Regenerates what's based on a variable that just changed (shades and scales). */
export function followBase(doc: CanvasDocument, variableId: string): void {
  const store = TokenStore.of(doc);
  for (const record of [...store.generators(), ...store.scales()]) {
    if (record.baseVar === variableId) regenerate(doc, record);
  }
}

/** The generators and scales based on variables about to be deleted, keeping their last base. */
export function orphanedGenerators(store: TokenStore, deleted: readonly string[]): TokenRecord[] {
  const gone = new Set(deleted);
  return [
    ...store
      .generators()
      .filter((g) => g.baseVar && gone.has(g.baseVar))
      .map((g) => ({ ...g, baseVar: null, baseColor: generatorBase(store, g) ?? g.baseColor })),
    ...store
      .scales()
      .filter((s) => s.baseVar && gone.has(s.baseVar))
      .map((s) => ({ ...s, baseVar: null, baseValue: scaleBase(store, s) ?? s.baseValue })),
  ];
}
