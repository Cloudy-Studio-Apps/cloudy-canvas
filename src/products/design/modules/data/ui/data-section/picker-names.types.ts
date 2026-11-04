import type { FieldType } from "../../source";

/** A name a field picker offers: the expression it inserts, shown by its alias with a sample. */
export interface PickerName {
  /** Exactly as `namesInScope` built it (quoted keys included). */
  expr: string;
  /** The field's alias, else the expression. */
  label: string;
  /** The source (the expression's first name) it's listed under. */
  group: string;
  /** Its value in the first row, as text. */
  sample: string;
  /** The data type, `null` when unknown. */
  type: FieldType | null;
}
