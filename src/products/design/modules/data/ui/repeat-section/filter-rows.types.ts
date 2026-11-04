import type { DataCondition } from "../../bindings";
import type { PickerName } from "../data-section/picker-names.types";

export interface FilterRowsProps {
  filter: readonly DataCondition[];
  /** The row's fields. */
  names: readonly PickerName[];
  onChange: (filter: DataCondition[]) => void;
}
