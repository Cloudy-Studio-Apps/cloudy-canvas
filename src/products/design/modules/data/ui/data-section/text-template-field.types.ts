import type { PickerName } from "./picker-names.types";

export interface TextTemplateFieldProps {
  /** The template's text, `{expr}` tokens and all. */
  value: string;
  names: readonly PickerName[];
  onCommit: (text: string) => void;
}
