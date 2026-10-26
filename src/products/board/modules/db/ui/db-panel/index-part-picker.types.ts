import type { DbIndexPart, DbTableElement } from "../../table/db-table.types";

export interface IndexPartPickerProps {
  table: DbTableElement;
  /** Parts already in the index (their columns aren't offered again). */
  parts: readonly DbIndexPart[];
  onAdd: (part: DbIndexPart) => void;
}
