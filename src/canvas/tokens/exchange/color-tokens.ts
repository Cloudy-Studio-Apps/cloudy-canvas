import { DEFAULT_VALUE } from "../default-value";
import type { TokenRecord, VariableRecord } from "../token.types";
import { valueRefs } from "../value-refs";

/**
 * Only the color variables of a set of records, with what they need: their collections, the axes
 * they (or their shade generators) vary by, and those generators. Number scales and styles are
 * left out, and a value aliasing a variable that isn't kept is dropped (a variable left without
 * its default goes too).
 */
export function colorTokensOnly(records: readonly TokenRecord[]): TokenRecord[] {
  const colors = records.filter(
    (r): r is VariableRecord => r.kind === "variable" && r.type === "color",
  );
  // Dropping a variable can leave others aliasing it, so this runs until nothing changes.
  let variables: VariableRecord[] = colors;
  for (;;) {
    const kept = new Set(variables.map((v) => v.id));
    const next = variables
      .map((v) => ({
        ...v,
        values: Object.fromEntries(
          Object.entries(v.values).filter(([, value]) =>
            valueRefs(value).every((ref) => kept.has(ref)),
          ),
        ),
      }))
      .filter((v) => DEFAULT_VALUE in v.values);
    const changed =
      next.length !== variables.length ||
      next.some(
        (v, i) => Object.keys(v.values).length !== Object.keys(variables[i]!.values).length,
      );
    variables = next;
    if (!changed) break;
  }
  const generators = records.filter(
    (r) => r.kind === "generator" && variables.some((v) => v.generatorId === r.id),
  );
  const generatorIds = new Set(generators.map((g) => g.id));
  variables = variables.map((v) => ({
    ...v,
    generatorId: v.generatorId && generatorIds.has(v.generatorId) ? v.generatorId : null,
  }));
  const collections = new Set(variables.map((v) => v.collectionId));
  const axes = new Set<string>();
  for (const r of [...variables, ...generators]) {
    if ("axisId" in r && r.axisId) axes.add(r.axisId);
  }
  return [
    ...records.filter((r) => r.kind === "axis" && axes.has(r.id)),
    ...records.filter((r) => r.kind === "collection" && collections.has(r.id)),
    ...variables,
    ...generators,
  ];
}
