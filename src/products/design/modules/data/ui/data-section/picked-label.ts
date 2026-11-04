import { normalizePath } from "../../table";
import type { PickerName } from "./picker-names.types";

/** The name an expression picks, compared in its one written form (old files may spell it bare). */
export function pickedName(names: readonly PickerName[], expr: string): PickerName | undefined {
  const target = normalizePath(expr);
  return names.find((name) => normalizePath(name.expr) === target);
}

/** How a chosen expression reads: its name's label, else the expression itself. */
export function pickedLabel(names: readonly PickerName[], expr: string): string {
  return pickedName(names, expr)?.label ?? expr;
}
