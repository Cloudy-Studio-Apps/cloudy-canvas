import type { DataBinding, DataBindableField } from "../../bindings";
import type { PickerName } from "./picker-names.types";

export interface BindFieldRowProps {
  field: DataBindableField;
  /** The data it's bound to now. */
  binding: DataBinding | undefined;
  /** The names that fit the field's type. */
  names: readonly PickerName[];
  /** A binding to the expression, or `null` to unbind it. */
  onChange: (binding: DataBinding | null) => void;
}
