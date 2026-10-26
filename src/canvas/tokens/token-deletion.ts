import { orphanedGenerators } from "./generator-writes";
import { stylesWithout } from "./style-bindings";
import type { TokenStore } from "./token-store";
import type { TokenRecord } from "./token.types";

/**
 * The records deleting these tokens rewrites (before they're removed): generators and scales that
 * followed one keep their last base value, styles using one keep the value it gave, and variables
 * declared to be read on one lose that pair.
 */
export function deletionRewrites(store: TokenStore, deleted: readonly string[]): TokenRecord[] {
  const gone = new Set(deleted);
  const unpaired = store
    .variables()
    .filter((v) => !gone.has(v.id) && v.contrastWith?.some((id) => gone.has(id)))
    .map((v) => ({ ...v, contrastWith: v.contrastWith?.filter((id) => !gone.has(id)) }));
  return [
    ...orphanedGenerators(store, deleted),
    ...stylesWithout(store, gone).filter((s) => !gone.has(s.id)),
    ...unpaired,
  ];
}
