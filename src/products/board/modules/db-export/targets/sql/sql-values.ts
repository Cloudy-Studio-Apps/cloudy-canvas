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
