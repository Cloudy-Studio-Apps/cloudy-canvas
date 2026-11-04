import type { DataCondition } from "../../bindings";
import type { PickerName } from "./picker-names.types";

export interface ConditionFieldProps {
  /** The layer's show condition now. */
  condition: DataCondition | undefined;
  names: readonly PickerName[];
  /** The new condition, or `null` to remove it. */
  onChange: (condition: DataCondition | null) => void;
}
