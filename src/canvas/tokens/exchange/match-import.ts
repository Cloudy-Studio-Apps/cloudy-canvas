import type { TokenStore } from "../token-store";
import type {
  CollectionRecord,
  ModeAxisRecord,
  StyleRecord,
  TokenRecord,
  VariableRecord,
} from "../token.types";
import type { ImportMatches } from "./import-plan.types";

const same = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase();

/**
 * Lines incoming records up with the file's: axes and collections by id, else by name (modes by
 * id, else by name); variables and styles by id, else as a conflict with the one of the same
 * collection and path (or style type and name).
 */
export function matchImport(store: TokenStore, incoming: readonly TokenRecord[]): ImportMatches {
  const ids = new Map<string, string>();
  const modes = new Map<string, string>();
  for (const axis of ofKind<ModeAxisRecord>(incoming, "axis")) {
    const existing = store.axis(axis.id) ?? store.axes().find((a) => same(a.name, axis.name));
    ids.set(axis.id, existing?.id ?? axis.id);
    for (const mode of axis.modes) {
      const match =
        existing?.modes.find((m) => m.id === mode.id) ??
        existing?.modes.find((m) => same(m.name, mode.name));
      modes.set(mode.id, match?.id ?? mode.id);
    }
  }
  for (const c of ofKind<CollectionRecord>(incoming, "collection")) {
    const existing =
      store.collection(c.id) ?? store.collections().find((o) => same(o.name, c.name));
    ids.set(c.id, existing?.id ?? c.id);
  }
  const tokens: ImportMatches["tokens"] = new Map();
  for (const v of ofKind<VariableRecord>(incoming, "variable")) {
    if (store.variable(v.id)) tokens.set(v.id, { kind: "same-id" });
    else {
      const named = store.byPath(ids.get(v.collectionId) ?? v.collectionId, v.name);
      tokens.set(v.id, named ? { kind: "conflict", existingId: named.id } : { kind: "new" });
    }
  }
  for (const s of ofKind<StyleRecord>(incoming, "style")) {
    if (store.style(s.id)) tokens.set(s.id, { kind: "same-id" });
    else {
      const named = store.styles(s.styleType).find((o) => o.name === s.name);
      tokens.set(s.id, named ? { kind: "conflict", existingId: named.id } : { kind: "new" });
    }
  }
  return { ids, modes, tokens };
}

export function ofKind<R extends TokenRecord>(
  records: readonly TokenRecord[],
  kind: R["kind"],
): R[] {
  return records.filter((r): r is R => r.kind === kind).sort((a, b) => cmp(a.order, b.order));
}

function cmp(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0;
}
