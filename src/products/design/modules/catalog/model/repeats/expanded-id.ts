/** An expanded page's or section's id: the template's for `[]`, else `${from}@${path.join("/")}`. */
export function expandedId(from: string, path: readonly string[]): string {
  return path.length === 0 ? from : `${from}@${path.join("/")}`;
}
