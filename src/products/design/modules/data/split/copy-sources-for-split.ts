import { hasDataFields } from "../bindings/binding-fields";
import { repeatOf } from "../repeat/repeat-fields";
import { dataSourcesIn } from "../source/data-sources-in";
import type { SplitSourcesInput } from "./copy-sources-for-split.types";

/**
 * A page split out into a new file keeps the data sources when some layer on it is bound to data
 * or repeats rows; nothing otherwise. Their saved data and pictures come with them (the split
 * copies every asset the new file refers to).
 */
export function copySourcesForSplit({ source, target, nodes }: SplitSourcesInput): void {
  if (!nodes.some((node) => hasDataFields(node) || repeatOf(node) !== null)) return;
  // shortcut: copies every source, not only the ones the page reads; narrow it when bindings name their sources structurally
  target.addAllUntracked(dataSourcesIn(source));
}
