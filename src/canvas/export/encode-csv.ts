/**
 * CSV (RFC 4180) for grids of text: one block per grid, separated by a blank line. Fields with
 * commas, quotes or line breaks are quoted.
 */
export function encodeCsv(grids: readonly (readonly (readonly string[])[])[]): string {
  return grids
    .map((rows) => rows.map((row) => row.map(csvField).join(",")).join("\r\n"))
    .join("\r\n\r\n");
}

function csvField(value: string): string {
  return /[",\r\n]/.test(value) ? `"${value.replaceAll('"', '""')}"` : value;
}
