import type { DataCondition, SortRule } from "../../../data";

/**
 * What a brochure section or page repeats over: a list in scope, read like a card repeater's
 * (`RepeatSettings`). A section's pages, subsections included, are copied for each row; a page is
 * copied for each `perPage` rows.
 */
export interface BrochureRepeat {
  /** An expression for a list in scope: `products`, `category.products`. */
  source: string;
  /** The row's name inside, `item` by default. */
  as: string;
  /** A path read in the row's scope (`item.id`) giving each row's identity; else the position. */
  key?: string;
  /** All must hold for a row to repeat. */
  filter: DataCondition[];
  sort: SortRule[];
  /** Caps the rows everywhere (document and export). */
  limit?: number;
  /** The copies made while designing; the rest are pending pages, made at export. Default 3. */
  designLimit?: number;
  /**
   * The row the user's own template pages show while designing (0 when unset). Only there: in an
   * export the template takes the first row, and every pass inside a copy (an inner repeat's
   * template pass too) always starts at its first row not detached, so a copy's pages show the
   * same rows while designing and in an export.
   */
  previewRow?: number;
  /** Pages only: the rows on each copy (≥ 1, default 1); above 1, `as` is the page's list of rows. */
  perPage?: number;
  /**
   * Detached copies, each its whole copy path (`copyPathKey`: the segments of the copies around
   * it, then its own `copySegment(owner, key)`), so detaching product 3 in one category leaves
   * product 3 of the others alone. Never made again, nor shown on the template.
   */
  detached: string[];
  /**
   * Single pages of its copies taken out by hand (detached or deleted), each named by the rows it
   * showed (`expandedId(from, ExpandedPage.rows)`, its innermost loop's): no copy is made for them,
   * while the rest of their pass still is. A detached one's slot (`BrochureSlot.detached`) stands
   * in its place.
   */
  detachedPages?: string[];
}

/** A slot a repeat made: the template slot it copies and the copy keys of every loop around it. */
export interface GeneratedSlot {
  /** The template slot's id. */
  from: string;
  /** Its copy segments (`copySegment`), outermost first: the `ExpandedPage.path` it was made for. */
  path: string[];
}

/**
 * A page taken out of a repeat (`BrochureSlot.detached`): it was a copy, and it's now a plain page
 * outside every run, where the copy was.
 */
export interface DetachedSlot {
  /** The loop it was made by (the innermost of its path): the repeating section's or slot's id. */
  owner: string;
  /** The template slot it copied. */
  from: string;
  /** The copy segments it was made for (`GeneratedSlot.path`). */
  path: string[];
  /**
   * The rows it showed (`ExpandedPage.rows`): its place among the copies. Missing in slots
   * detached before it was kept: read `rows ?? path` (`detachedRows`).
   */
  rows?: string[];
}
