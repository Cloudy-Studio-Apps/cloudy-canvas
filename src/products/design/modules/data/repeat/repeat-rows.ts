import { childScope, evaluateCondition, lookup } from "../bindings";
import type { DataScope } from "../bindings";
import { rowNames } from "./row-names";
import { sortItems } from "./sort-rows";
import type { RepeatRows, RepeatSettings } from "./repeat.types";

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
  // Snapshot rows are frozen: this copy is the one filtered and sorted.
  let shown: unknown[] = [...list];
  if (repeat.filter.length > 0) {
    shown = shown.filter((row) => {
      const inRow = scopeOf(row);
      return repeat.filter.every((c) => evaluateCondition(c, inRow));
    });
  }
  shown = sortItems(shown, repeat.sort, scopeOf);
  if (repeat.limit !== undefined) shown = shown.slice(0, repeat.limit);
  const total = shown.length;
  if (phase === "design" && repeat.designLimit !== undefined) {
    shown = shown.slice(0, repeat.designLimit);
  }
  const used = new Set<string>();
  const rows = shown.map((row, index) => {
    const base =
      (repeat.key ? keyText(lookup(scopeOf(row), repeat.key)?.value) : null) ?? String(index);
    let key = base;
    for (let n = 2; used.has(key); n++) key = `${base}#${n}`;
    used.add(key);
    return { key, row, index };
  });
  return { rows, total };
}

/** The scope a copy's expressions read: the row under its name, plus `$index`, `$number` and `$count`. */
export function rowScope(
  parent: DataScope,
  repeat: RepeatSettings,
  row: unknown,
  index: number,
  total: number,
): DataScope {
  const { fields, sources } = rowNames(parent, repeat);
  return childScope(
    parent,
    { [repeat.as]: row, $index: index, $number: index + 1, $count: total },
    fields,
    sources,
  );
}
