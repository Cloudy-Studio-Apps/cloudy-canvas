/** A SQL string literal. */
export function sqlString(text: string): string {
  return `'${text.replace(/'/g, "''")}'`;
}

/** Quotes `name` with `quote` when it's reserved or isn't a plain lowercase identifier. */
export function quoteIdentifier(
  name: string,
  quote: string,
  reserved: ReadonlySet<string>,
): string {
  if (/^[a-z_][a-z0-9_]*$/.test(name) && !reserved.has(name)) return name;
  return `${quote}${name.replaceAll(quote, quote + quote)}${quote}`;
}

/** The index's name: its own, or `<table>_<columns>_<key|idx>` like PostgreSQL names them. */
export function indexName(table: string, columns: readonly string[], unique: boolean, n: number) {
  const parts = columns.length > 0 ? columns.join("_") : `expr${n > 0 ? n + 1 : ""}`;
  return `${table}_${parts}_${unique ? "key" : "idx"}`;
}
