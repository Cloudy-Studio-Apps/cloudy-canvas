import { childScope, fieldKey, rewriteTemplate } from "../bindings";
import type { DataScope } from "../bindings";
import type { DataField } from "../source";
import { formatPath, parsePath } from "../table";
import type { PathStep } from "../table";
import { rewriteRepeatPaths } from "./rename-repeat-paths";
import { rowNames } from "./row-names";
import type { DataFieldRenamer, FieldMove } from "./field-renamer.types";

/**
 * The renamer over `root`, whose renamed fields are the very `DataField` objects in `moves` (a
 * scope carries a source's field objects into every row name read from its rows, `rowNames`, so
 * finding one by identity says the expression reads that source's field, under any name).
 */
export function fieldRenamer(
  root: DataScope,
  moves: ReadonlyMap<DataField, FieldMove>,
): DataFieldRenamer {
  const expr = (scope: DataScope, text: string): string | null => {
    let steps: PathStep[];
    try {
      steps = parsePath(text);
    } catch {
      return null;
    }
    const first = steps[0];
    if (!first || !("key" in first)) return null;
    for (let s: DataScope | null = scope; s; s = s.parent) {
      // Data this device can't read is left alone.
      if (s.unreadable.has(first.key)) return null;
      if (!Object.hasOwn(s.names, first.key)) continue;
      // The longest start of the expression that is a field: the rest reads inside its value.
      for (let end = steps.length; end > 1; end--) {
        const field = s.fields.get(fieldKey(steps.slice(0, end)));
        if (!field) continue;
        const move = moves.get(field);
        if (!move || move.length >= end) return null;
        return formatPath([...steps.slice(0, end - move.length), ...move.to, ...steps.slice(end)]);
      }
      return null;
    }
    return null;
  };

  const rowScope = (scope: DataScope, source: string, as: string): DataScope =>
    childScope(scope, { [as]: undefined }, rowNames(scope, { source, as }).fields);

  return {
    root,
    expr,
    text: (scope, text) =>
      text.includes("{")
        ? (rewriteTemplate({ text, runs: [] }, (e) => expr(scope, e))?.text ?? null)
        : null,
    rowScope,
    repeat: (scope, repeat, as) => {
      if (repeat === null || typeof repeat !== "object") return null;
      const stored = repeat as Record<string, unknown>;
      const name = typeof stored.as === "string" && stored.as ? stored.as : as;
      const source = typeof stored.source === "string" ? stored.source : null;
      const inRow = name && source ? rowScope(scope, source, name) : null;
      return rewriteRepeatPaths(repeat, {
        source: (path) => expr(scope, path),
        ...(inRow ? { row: (path: string) => expr(inRow, path) } : {}),
      });
    },
  };
}
