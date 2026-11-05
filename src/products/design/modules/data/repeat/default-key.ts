import { lookup, type DataScope } from "../bindings";
import { formatPath } from "../table";
import type { RepeatSettings } from "./repeat.types";

/** Names that say a field is a row's identity, best first (compared lowercased). */
const ID_NAMES = ["id", "sku", "code", "slug", "uuid"];

const isRecord = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === "object" && !Array.isArray(value);

/** Whether every row has a value for `field` (a text or number) and no two share it. */
function unique(rows: readonly Record<string, unknown>[], field: string): boolean {
  const seen = new Set<string>();
  for (const row of rows) {
    const value = row[field];
    if (typeof value !== "string" && typeof value !== "number") return false;
    const text = String(value);
    if (text === "" || seen.has(text)) return false;
    seen.add(text);
  }
  return true;
}

/** How id-like a field's name is: its place in `ID_NAMES`, then a name ending in `Id`/`_id`. */
function rank(field: string): number {
  const at = ID_NAMES.indexOf(field.toLowerCase());
  if (at >= 0) return at;
  return /(?:[a-z0-9]Id|_id)$/.test(field) ? ID_NAMES.length : -1;
}

/**
 * The key a new repeat takes when none is given: a path to an id-like field of its rows (`id`,
 * `sku`, `code`, `slug`, `uuid` in any case, or a name ending in `Id`/`_id`) whose values are
 * there and unique on every row, so copies taken out by hand stay with their row when the list
 * changes. `undefined` when the list can't be read or no field qualifies (rows go by position).
 */
export function defaultRepeatKey(
  scope: DataScope,
  repeat: Pick<RepeatSettings, "source" | "as">,
): string | undefined {
  const list = lookup(scope, repeat.source)?.value;
  if (!Array.isArray(list) || list.length === 0 || !list.every(isRecord)) return undefined;
  const rows = list as Record<string, unknown>[];
  const fields = Object.keys(rows[0] ?? {})
    .map((field) => ({ field, rank: rank(field) }))
    .filter((item) => item.rank >= 0)
    .sort((a, b) => a.rank - b.rank);
  const found = fields.find((item) => unique(rows, item.field));
  return found ? formatPath([{ key: repeat.as }, { key: found.field }]) : undefined;
}
