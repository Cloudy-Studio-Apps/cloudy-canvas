import type { DbIndex, DbTableShape } from "@engine";

export interface IndexRowProps {
  table: DbTableShape;
  index: DbIndex;
  /** Id of the `<datalist>` with index method suggestions. */
  typeListId: string;
}
