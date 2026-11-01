import type * as React from "react";

export type TableKey = "own" | "link" | null;

/** One row of a `TableCard`. */
export interface TableCardRow {
  /** Unique in the picture: `KeyWires` finds rows by it. */
  id: string;
  name: string;
  /** A gold key when it identifies the row, a blue one when it points at another table. */
  key: TableKey;
  /** A word at the end of the row. */
  tag?: string | undefined;
  /** Something new, which this shape adds. */
  fresh?: boolean | undefined;
  /** Not saved in the table. */
  gone?: boolean | undefined;
  /** The row a line starts from. */
  picked?: boolean | undefined;
  /** Makes the row a button. */
  onPick?: (() => void) | undefined;
  disabled?: boolean | undefined;
  title?: string | undefined;
}

export interface TableCardProps {
  title: React.ReactNode;
  rows: readonly TableCardRow[];
  /** The outline: the entity's color; the primary color when it's a new table. */
  color?: string | undefined;
  fresh?: boolean | undefined;
  className?: string | undefined;
}

export interface TableCardRowProps {
  row: TableCardRow;
}
