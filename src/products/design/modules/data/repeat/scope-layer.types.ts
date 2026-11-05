import type { RowNames } from "./repeat.types";

/**
 * One loop around a layer, outermost first in a list: a row (or a page's rows) under `name`, the
 * loop it comes from and where the row is in it. Its scope is `rowScope` over the layers outside
 * it, which adds `$index`, `$number` and `$count`.
 */
export interface ScopeLayer {
  /** The row's name in scope (the repeat's `as`). */
  name: string;
  /** The row, a page's list of rows, or `undefined` for an empty list. */
  value: unknown;
  /** What repeats: a brochure section or slot id, or a card repeater's frame id. */
  owner: string;
  /** Where the row comes from, as the In scope view names it. */
  label: string;
  /** Its position in the loop (0-based). */
  index: number;
  /** How many rows (or pages) the loop has. */
  count: number;
  /**
   * What the name carries (`rowNames`: the list's fields under it and its source), so formats,
   * types and pictures apply to the row; left out, it carries none.
   */
  names?: RowNames;
  /**
   * Its list reads a source this device can't read: the name, `$index`, `$number` and `$count`
   * read as unreadable, so what reads them is left alone.
   */
  unreadable?: boolean;
}
