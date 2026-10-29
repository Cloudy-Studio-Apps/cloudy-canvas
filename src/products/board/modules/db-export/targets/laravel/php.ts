/** A PHP single-quoted string. */
export function phpString(text: string): string {
  return `'${text.replace(/\\/g, "\\\\").replace(/'/g, "\\'")}'`;
}

/** A one-line PHP array of strings: `['a', 'b']`. */
export function phpList(items: readonly string[]): string {
  return `[${items.map(phpString).join(", ")}]`;
}
