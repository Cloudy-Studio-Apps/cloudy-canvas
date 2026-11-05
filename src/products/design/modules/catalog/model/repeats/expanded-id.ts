import { copyPathKey } from "./copy-segment";

/** An expanded page's or section's id: the template's for `[]`, else `${from}@${copyPathKey(path)}`. */
export function expandedId(from: string, path: readonly string[]): string {
  return path.length === 0 ? from : `${from}@${copyPathKey(path)}`;
}
