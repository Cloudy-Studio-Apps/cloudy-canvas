import type { DbIndexPart, DbTableShape } from "@engine";

export interface IndexPartPickerProps {
  table: DbTableShape;
  /** Parts already in the index (their columns aren't offered again). */
  parts: readonly DbIndexPart[];
  onAdd: (part: DbIndexPart) => void;
}
