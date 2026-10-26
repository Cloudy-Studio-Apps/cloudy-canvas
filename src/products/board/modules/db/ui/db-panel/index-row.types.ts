import type { DbIndex, DbTableElement } from "../../table/db-table.types";

export interface IndexRowProps {
  table: DbTableElement;
  index: DbIndex;
  /** Id of the `<datalist>` with index method suggestions. */
  typeListId: string;
}
