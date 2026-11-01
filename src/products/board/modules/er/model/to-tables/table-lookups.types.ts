import type { ErRelationElement } from "../../relation/relation.types";
import type { ColumnDraft, TableDraft } from "./tables-context.types";

/** Where a relation's keys ended up. */
export interface ErRelationKeys {
  /** The table holding them: a side's own table, or a table made for the relation. */
  table: TableDraft;
  /** The keys, one per column they point at. */
  columns: ColumnDraft[];
  /** The participant whose table holds them; `null` when the relation got a table of its own. */
  holder: ErRelationElement["participants"][number] | null;
  /** The keys are part of the holder's own key (a weak entity's identifying relation). */
  identifies: boolean;
}

/** The columns an attribute became, and their table. */
export interface ErAttributeColumns {
  table: TableDraft;
  columns: ColumnDraft[];
}
