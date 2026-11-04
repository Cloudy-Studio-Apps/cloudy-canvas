import type { SortRule } from "../../repeat";
import type { PickerName } from "../data-section/picker-names.types";

export interface SortRowsProps {
  sort: readonly SortRule[];
  /** The row's fields. */
  names: readonly PickerName[];
  onChange: (sort: SortRule[]) => void;
}
