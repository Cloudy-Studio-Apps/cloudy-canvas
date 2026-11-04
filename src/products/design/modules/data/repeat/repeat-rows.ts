import { childScope, evaluateCondition, lookup } from "../bindings";
import type { DataScope } from "../bindings";
import { rowNames } from "./row-names";
import { sortItems } from "./sort-rows";
import type { RepeatRows, RepeatSettings, RowNames } from "./repeat.types";

function keyText(value: unknown): string | null {
  if (value === null || value === undefined || typeof value === "object") return null;
  const text = String(value);
  return text === "" ? null : text;
}

/** The rows an iterator shows: filtered, sorted, capped by `limit` (and `designLimit` in the document). */
export function repeatRows(
  repeat: RepeatSettings,
  scope: DataScope,
  phase: "design" | "export",
): RepeatRows {
  const list = lookup(scope, repeat.source)?.value;
  if (!Array.isArray(list)) return { rows: [], total: 0 };
  const { fields, sources } = rowNames(scope, repeat);
  const scopeOf = (row: unknown) => childScope(scope, { [repeat.as]: row }, fields, sources);
  // Snapshot rows are frozen: this copy is the one filtered and sorted. `src` is a row's place in
  // the list, which positional keys use so a filter or sort never renames the rows left.
  let shown = list.map((row: unknown, src: number) => ({ row, src }));
  if (repeat.filter.length > 0) {
    shown = shown.filter((item) => {
      const inRow = scopeOf(item.row);
      return repeat.filter.every((c) => evaluateCondition(c, inRow));
    });
  }
  shown = sortItems(shown, repeat.sort, (item) => scopeOf(item.row));
  // Keys are made over every shown row, before any cap, in source order: a row keeps its key in
  // the document and in an export, and the `#n` suffixes don't depend on the sort.
  const keys: string[] = new Array(shown.length);
  const used = new Set<string>();
  shown
    .map((item, index) => ({ item, index }))
    .sort((x, y) => x.item.src - y.item.src)
    .forEach(({ item, index }) => {
      const base =
        (repeat.key ? keyText(lookup(scopeOf(item.row), repeat.key)?.value) : null) ??
        String(item.src);
      let key = base;
      for (let n = 2; used.has(key); n++) key = `${base}#${n}`;
      used.add(key);
      keys[index] = key;
    });
  let rows = shown.map((item, index) => ({ key: keys[index] as string, row: item.row, index }));
  if (repeat.limit !== undefined) rows = rows.slice(0, repeat.limit);
  const total = rows.length;
  if (phase === "design" && repeat.designLimit !== undefined) {
    rows = rows.slice(0, repeat.designLimit);
  }
  return { rows, total };
}

/**
 * The scope a copy's expressions read: the row under its name, plus `$index`, `$number` and
 * `$count`. `names` (`rowNames`) can be made once for an iterator's rows.
 */
export function rowScope(
  parent: DataScope,
  repeat: RepeatSettings,
  row: unknown,
  index: number,
  total: number,
  names: RowNames = rowNames(parent, repeat),
): DataScope {
  const { fields, sources } = names;
  return childScope(
    parent,
    { [repeat.as]: row, $index: index, $number: index + 1, $count: total },
    fields,
    sources,
  );
}
