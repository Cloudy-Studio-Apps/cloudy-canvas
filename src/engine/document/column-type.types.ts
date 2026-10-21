/** A column type split into its name and its arguments, e.g. `varchar` and `255`. */
export interface ColumnType {
  /** The type name, with a trailing `[]` for arrays (e.g. `int[]`). */
  type: string;
  /** What goes between the parentheses (e.g. `255`, `10, 2`), or `""` for none. */
  typeArgs: string;
}
