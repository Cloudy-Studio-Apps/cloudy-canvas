import type { PickerName } from "./picker-names.types";

/** How a chosen expression reads: its name's label, else the expression itself. */
export function pickedLabel(names: readonly PickerName[], expr: string): string {
  return names.find((name) => name.expr === expr)?.label ?? expr;
}
