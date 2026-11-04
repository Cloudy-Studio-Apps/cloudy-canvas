import type { FieldType } from "../source";

/** A field of a layer data can fill, and the data types that fit it. */
export interface DataBindableField {
  /** Its key in `dataBindings` (`"fills.0.color"`, `"opacity"`, `"fills.0.image"`). */
  path: string;
  label: string;
  accepts: readonly FieldType[];
}
