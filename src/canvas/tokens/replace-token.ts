import { mapValueRefs, valueRefs } from "./value-refs";
import type { TokenStore } from "./token-store";
import type { TokenRecord, TokenValue } from "./token.types";

/**
 * The token records replacing `from` by `to` writes: aliases of `from` now alias `to` (and
 * expressions read it), styles
 * binding `from` bind `to`, generators and scales following `from` follow `to`. Refuses a token of
 * another kind or type, the same token, or a `to` whose alias chain reaches `from` (a loop).
 */
export function replacePlan(store: TokenStore, from: string, to: string): TokenRecord[] {
  const nameOf = (id: string) => store.variable(id)?.name ?? store.style(id)?.name ?? id;
  const fail = (why: string): never => {
    throw new Error(`Can't replace ${nameOf(from)} with ${nameOf(to)}: ${why}.`);
  };
  if (from === to) fail("it's the same token");
  const fromVar = store.variable(from);
  const toVar = store.variable(to);
  const fromStyle = store.style(from);
  const toStyle = store.style(to);
  if (fromVar) {
    if (!toVar) return fail("a variable is replaced by a variable");
    if (toVar.type !== fromVar.type) fail(`one is a ${fromVar.type}, the other a ${toVar.type}`);
    // `to` must not depend on `from`, or its values would come back round to themselves.
    if (store.aliasDependents(from).has(to)) fail(`${toVar.name} aliases ${fromVar.name}`);
  } else if (fromStyle) {
    if (!toStyle) return fail("a style is replaced by a style");
    if (toStyle.styleType !== fromStyle.styleType) fail("they're styles of different kinds");
  } else {
    return fail("there's no such token");
  }
  const records: TokenRecord[] = [];
  if (fromVar) {
    for (const variable of store.variables()) {
      let changed = false;
      const values: Record<string, TokenValue> = {};
      for (const [key, value] of Object.entries(variable.values)) {
        if (valueRefs(value).includes(from)) {
          values[key] = mapValueRefs(value, (id) => (id === from ? to : id));
          changed = true;
        } else values[key] = value;
      }
      // Declared contrast pairs follow too.
      const pairs = variable.contrastWith;
      const contrastWith = pairs?.includes(from)
        ? [...new Set(pairs.map((id) => (id === from ? to : id)))].filter(
            (id) => id !== variable.id,
          )
        : pairs;
      if (contrastWith !== pairs) changed = true;
      if (changed) records.push({ ...variable, values, ...(contrastWith ? { contrastWith } : {}) });
    }
    for (const style of store.styles()) {
      const bindings = style.bindings ?? {};
      if (!Object.values(bindings).includes(from)) continue;
      const next = Object.fromEntries(
        Object.entries(bindings).map(([path, id]) => [path, id === from ? to : id]),
      );
      records.push({ ...style, bindings: next });
    }
    // `from` read on surfaces: `to` is read on them too.
    const own = fromVar.contrastWith ?? [];
    if (own.length > 0 && toVar) {
      const written = records.find((r) => r.id === to);
      const base = written?.kind === "variable" ? written : toVar;
      const merged = [...new Set([...(base.contrastWith ?? []), ...own])].filter((id) => id !== to);
      const next = { ...base, contrastWith: merged };
      if (written) records[records.indexOf(written)] = next;
      else records.push(next);
    }
    for (const generator of [...store.generators(), ...store.scales()]) {
      if (generator.baseVar === from) records.push({ ...generator, baseVar: to });
    }
  }
  return records;
}
