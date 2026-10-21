export type TableSide = "left" | "right";

/** A column handle under the pointer. */
export interface HandleHit {
  row: number;
  side: TableSide;
}
