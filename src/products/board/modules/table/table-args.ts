/** An agent's `cells`: rows of strings (numbers are written as text), or `undefined` if invalid. */
export function readCells(value: unknown): string[][] | undefined {
  return readRows(value, (cell) =>
    typeof cell === "string" || typeof cell === "number" ? String(cell) : "",
  );
}

/** An agent's `fills`: rows of colors (`""` for none), or `undefined` if invalid. */
export function readFills(value: unknown): string[][] | undefined {
  return readRows(value, (cell) => (typeof cell === "string" ? cell : ""));
}

/** Rows read with `read`, or an error naming `key` when they're invalid. */
export function requireRows(
  read: (value: unknown) => string[][] | undefined,
  value: unknown,
  key: string,
): string[][] {
  const rows = read(value);
  if (!rows) throw new Error(`"${key}" must be a non-empty array of rows (arrays of strings).`);
  return rows;
}

function readRows(value: unknown, read: (cell: unknown) => string): string[][] | undefined {
  if (!Array.isArray(value)) return undefined;
  if (value.length === 0 || !value.every((row) => Array.isArray(row))) return undefined;
  return value.map((row: unknown[]) => row.map(read));
}
