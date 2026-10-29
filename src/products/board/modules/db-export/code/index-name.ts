/** The index's name: its own, or `<table>_<columns>_<key|idx>` like PostgreSQL names them. */
export function indexName(
  table: string,
  columns: readonly string[],
  unique: boolean,
  n: number,
): string {
  const parts = columns.length > 0 ? columns.join("_") : `expr${n > 0 ? n + 1 : ""}`;
  return `${table}_${parts}_${unique ? "key" : "idx"}`;
}
