import { lookup, namesInScope, type DataScope } from "../../bindings";
import { parsePath } from "../../table";
import type { PickerName } from "../data-section/picker-names.types";
import { t } from "../../data.i18n";

const COUNT = ".$count";

/**
 * The lists a frame can repeat in a scope: each source (its rows) and each list field of a row
 * around it (`item.specs`), never one read from a fixed row (`products[0].specs`).
 */
export function listNames(scope: DataScope): PickerName[] {
  const out: PickerName[] = [];
  const seen = new Set<string>();
  for (const { expr, field } of namesInScope(scope)) {
    let list: string;
    if (field === null && expr.endsWith(COUNT)) list = expr.slice(0, -COUNT.length);
    else if (field && !field.hidden) list = expr;
    else continue;
    if (seen.has(list)) continue;
    let steps;
    try {
      steps = parsePath(list);
    } catch {
      continue;
    }
    const first = steps[0];
    if (!first || !("key" in first) || steps.some((step) => "index" in step)) continue;
    const value = lookup(scope, list)?.value;
    if (!Array.isArray(value)) continue;
    seen.add(list);
    out.push({
      expr: list,
      label: field?.alias ?? list,
      group: first.key,
      sample: t("source.rows", { count: value.length }),
      type: "list",
    });
  }
  return out;
}
