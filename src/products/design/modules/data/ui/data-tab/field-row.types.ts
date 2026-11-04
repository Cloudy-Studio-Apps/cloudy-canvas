import type { DataField } from "../../source";

export interface FieldRowProps {
  field: DataField;
  /** Its value in the first row, as text. */
  sample: string;
  /** An image field whose pictures aren't saved in the file yet: an Update downloads them. */
  needsUpdate: boolean;
  onChange: (field: DataField) => void;
}
