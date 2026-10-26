import { TokenStore, type TokenPick, type TokenRecord } from "@canvas";

import type { PickRow } from "./exchange.types";

const topGroup = (path: string) => path.split("/")[0] ?? path;

/**
 * The import tree: each collection with its top-level groups, then each style type with its
 * styles' top-level groups. A row's key is `v:<collection>:<group>` or `s:<type>:<group>`.
 */
export function pickRows(
  records: readonly TokenRecord[],
  typeLabel: (type: string) => string,
): PickRow[] {
  const store = new TokenStore(records);
  const rows: PickRow[] = [];
  for (const c of store.collections()) {
    const groups = groupCounts(store.variables(c.id).map((v) => v.name));
    if (groups.size === 0) continue;
    rows.push({
      key: `c:${c.id}`,
      label: c.name,
      count: store.variables(c.id).length,
      children: [...groups].map(([group, count]) => ({
        key: `v:${c.id}:${group}`,
        label: group,
        count,
        children: [],
      })),
    });
  }
  const types = [...new Set(store.styles().map((s) => s.styleType))];
  for (const type of types) {
    const styles = store.styles(type);
    const groups = groupCounts(styles.map((s) => s.name));
    rows.push({
      key: `t:${type}`,
      label: typeLabel(type),
      count: styles.length,
      children: [...groups].map(([group, count]) => ({
        key: `s:${type}:${group}`,
        label: group,
        count,
        children: [],
      })),
    });
  }
  return rows;
}

/** Every group key, all ticked. */
export function allKeys(rows: readonly PickRow[]): Set<string> {
  return new Set(rows.flatMap((row) => row.children.map((child) => child.key)));
}

/**
 * What the ticked groups pick: a collection with every group ticked whole (its shade generators
 * and scales come too), otherwise its ticked groups.
 */
export function pickOf(records: readonly TokenRecord[], ticked: ReadonlySet<string>): TokenPick {
  const store = new TokenStore(records);
  const whole = store
    .collections()
    .filter((c) => store.variables(c.id).every((v) => ticked.has(`v:${c.id}:${topGroup(v.name)}`)))
    .map((c) => c.id);
  const groups: { collectionId: string; group: string }[] = [];
  const styles: string[] = [];
  for (const key of ticked) {
    const [kind, owner = "", ...rest] = key.split(":");
    const group = rest.join(":");
    if (kind === "v" && !whole.includes(owner)) groups.push({ collectionId: owner, group });
    else if (kind === "s") {
      for (const s of store.styles(owner)) if (topGroup(s.name) === group) styles.push(s.id);
    }
  }
  return { collections: whole, groups, styles, styleTypes: [] };
}

function groupCounts(paths: readonly string[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const path of paths) {
    const group = topGroup(path);
    counts.set(group, (counts.get(group) ?? 0) + 1);
  }
  return counts;
}
