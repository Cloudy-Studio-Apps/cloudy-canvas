/**
 * A copy's step in a path: the loop that made it (the repeating section's or slot's id) and its
 * row's key, encoded so a `/` or `:` in the key never splits it. Template passes add none.
 */
export function copySegment(owner: string, key: string): string {
  return `${owner}:${encodeURIComponent(key)}`;
}

/** A copy path as one string: what `BrochureRepeat.detached` holds and `expandedId` appends. */
export function copyPathKey(path: readonly string[]): string {
  return path.join("/");
}
