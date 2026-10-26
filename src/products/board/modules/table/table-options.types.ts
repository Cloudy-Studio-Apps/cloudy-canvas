/** New and selected tables' header tint, and whether their first row is a header. */
export interface TableToolOptions {
  tableColor: string;
  /** The color variable the header tint is bound to (`null`: the color as picked). */
  tableColorToken: string | null;
  tableHeader: boolean;
}
