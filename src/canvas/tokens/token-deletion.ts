import { bakedAliases } from "./baked-aliases";
import { orphanedGenerators } from "./generator-writes";
import { stylesWithout } from "./style-bindings";
import type { TokenStore } from "./token-store";
import type { TokenRecord } from "./token.types";

/**
 * The records deleting these tokens rewrites (before they're removed): generators and scales that
 * followed one keep their last base value, styles using one keep the value it gave, variables
 * aliasing one keep the value it gave them, and variables declared to be read on one lose that pair.
 */
export function deletionRewrites(store: TokenStore, deleted: readonly string[]): TokenRecord[] {
  const gone = new Set(deleted);
  // A variable may both alias and be read on a deleted one: its rewrites are merged.
  const variables = new Map(bakedAliases(store, gone).map((v) => [v.id, v]));
  for (const v of store.variables()) {
    if (gone.has(v.id) || !v.contrastWith?.some((id) => gone.has(id))) continue;
    const base = variables.get(v.id) ?? v;
    variables.set(v.id, { ...base, contrastWith: v.contrastWith.filter((id) => !gone.has(id)) });
  }
  return [
    ...orphanedGenerators(store, deleted),
    ...stylesWithout(store, gone).filter((s) => !gone.has(s.id)),
    ...variables.values(),
  ];
}
