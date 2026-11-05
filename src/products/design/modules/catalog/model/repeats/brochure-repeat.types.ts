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
  /** The row the template pages show while designing (0 when unset). */
  previewRow?: number;
  /** Pages only: the rows on each copy (≥ 1, default 1); above 1, `as` is the page's list of rows. */
  perPage?: number;
  /** Copy keys of detached copies: never made again. */
  detached: string[];
}

/** A slot a repeat made: the template slot it copies and the copy keys of every loop around it. */
export interface GeneratedSlot {
  /** The template slot's id. */
  from: string;
  /** Copy keys, outermost first. */
  path: string[];
}
