import type { DataField } from "../source";
import { joinKey, parsePath } from "../table";
import { fieldKey, lookup } from "../bindings";
import type { DataScope } from "../bindings";
import type { RepeatSettings, RowNames } from "./repeat.types";

/**
 * The fields and source a row name has: the list's fields re-keyed under `as` (`products[].price`
 * → `item.price`) so formats and types apply inside copies, and the list's source so pictures
 * resolve per source.
 */
export function rowNames(
  parent: DataScope,
  repeat: Pick<RepeatSettings, "source" | "as">,
): RowNames {
  const fields = new Map<string, DataField>();
  const sources = new Map<string, string>();
  const found = lookup(parent, repeat.source);
  if (found?.source) sources.set(repeat.as, found.source);
  let prefix: string;
  try {
    prefix = `${fieldKey(parsePath(repeat.source))}[]`;
  } catch {
    return { fields, sources };
  }
  const name = joinKey("", repeat.as);
  for (let s: DataScope | null = parent; s; s = s.parent) {
    for (const [key, field] of s.fields) {
      if (!key.startsWith(prefix)) continue;
      const rest = key.slice(prefix.length);
      if (rest && (rest[0] === "." || rest[0] === "[")) {
        const mapped = name + rest;
        if (!fields.has(mapped)) fields.set(mapped, field);
      }
    }
  }
  return { fields, sources };
}
