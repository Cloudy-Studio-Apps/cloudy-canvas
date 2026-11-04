import { getLocale } from "@shared/core";

import { toNumber } from "../bindings/coerce";
import { lookup } from "../bindings";
import type { DataScope } from "../bindings";
import type { SortRule } from "./repeat.types";

interface SortValue {
  /** `null` for a missing value (sorted last). */
  text: string | null;
  number: number | null;
}

function sortValue(scope: DataScope, path: string): SortValue {
  const found = lookup(scope, path);
  const value = found?.value;
  if (value === null || value === undefined || value === "") return { text: null, number: null };
  if (typeof value === "object") return { text: null, number: null };
  return { text: String(value), number: toNumber(value, found?.field?.type ?? null) };
}

function compare(a: SortValue, b: SortValue, locale: string): number {
  if (a.number !== null && b.number !== null) return a.number - b.number;
  return (a.text ?? "").localeCompare(b.text ?? "", locale, { numeric: true });
}

/**
 * Sorts items by the rules (stable): numbers numerically when both values are numeric, else text
 * with the app locale and numeric collation; missing values last whichever the direction.
 * `scopeOf` gives the scope an item's paths are read in.
 */
export function sortItems<T>(items: T[], rules: SortRule[], scopeOf: (item: T) => DataScope): T[] {
  if (rules.length === 0) return items;
  const locale = getLocale();
  const keyed = items.map((item, position) => {
    const scope = scopeOf(item);
    return { item, position, values: rules.map((r) => sortValue(scope, r.path)) };
  });
  keyed.sort((x, y) => {
    for (let i = 0; i < rules.length; i++) {
      const a = x.values[i] as SortValue;
      const b = y.values[i] as SortValue;
      if (a.text === null || b.text === null) {
        if (a.text === b.text) continue;
        return a.text === null ? 1 : -1;
      }
      const c = compare(a, b, locale);
      if (c !== 0) return (rules[i] as SortRule).descending ? -c : c;
    }
    return x.position - y.position;
  });
  return keyed.map((k) => k.item);
}
