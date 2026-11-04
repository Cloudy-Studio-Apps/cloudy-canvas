import type { PickerName } from "./picker-names.types";

export interface FieldPickerButtonProps {
  names: readonly PickerName[];
  /** The expression chosen now; unset shows `placeholder`. */
  value: string | undefined;
  onPick: (expr: string) => void;
  /** The button's aria label. */
  label?: string;
  /** Shown while nothing is chosen ("Choose a field" by default). */
  placeholder?: string;
}
