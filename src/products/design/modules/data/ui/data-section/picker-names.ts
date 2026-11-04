import { lookup, namesInScope, type DataScope } from "../../bindings";
import { parsePath } from "../../table";
import { valueText } from "../data-tab/value-text";
import type { PickerName } from "./picker-names.types";
import { t } from "../../data.i18n";

const COUNT = ".$count";

/** What pickers offer in a scope, from `namesInScope`: hidden fields left out. */
export function pickerNames(scope: DataScope): PickerName[] {
  const out: PickerName[] = [];
  for (const { expr, field } of namesInScope(scope)) {
    if (field?.hidden) continue;
    const first = parsePath(expr)[0];
    const group = first && "key" in first ? first.key : expr;
    const count = field === null && expr.endsWith(COUNT);
    out.push({
      expr,
      label: count ? t("section.fields.count") : (field?.alias ?? expr),
      group,
      sample: valueText(lookup(scope, expr)?.value),
      type: count ? "integer" : (field?.type ?? null),
    });
  }
  return out;
}
