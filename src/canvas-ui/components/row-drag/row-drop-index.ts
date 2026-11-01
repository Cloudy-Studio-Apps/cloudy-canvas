import type { RowDropSide } from "./row-drag.types";

/** Where a row at `from` ends up when dropped on the row at `over`: it leaves a gap behind it. */
export function rowDropIndex(from: number, over: number, side: RowDropSide): number {
  const to = over + (side === "after" ? 1 : 0);
  return from < to ? to - 1 : to;
}
