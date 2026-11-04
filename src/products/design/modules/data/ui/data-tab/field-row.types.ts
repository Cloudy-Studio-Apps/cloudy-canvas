import type { DataField } from "../../source";

export interface FieldRowProps {
  field: DataField;
  /** Its value in the first row, as text. */
  sample: string;
  onChange: (field: DataField) => void;
}
