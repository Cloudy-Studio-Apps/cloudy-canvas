import type { DbIndex, DbTableElement } from "@board";

export interface IndexRowProps {
  table: DbTableElement;
  index: DbIndex;
  /** Id of the `<datalist>` with index method suggestions. */
  typeListId: string;
}
