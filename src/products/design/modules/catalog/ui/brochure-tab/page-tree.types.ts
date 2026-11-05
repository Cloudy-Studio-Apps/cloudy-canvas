import type { BookSide } from "../../model/book-layout.types";
import type { BrochurePage, StartingSection } from "../../model/brochure-pages.types";

/** What every row of the page list has. */
interface TreeRow {
  /** How far it's indented: the folders it's in. */
  depth: number;
  /**
   * The depth of the repeat run it's in (a repeating section or page, its copies and the pages
   * still to make), where the run's bracket is drawn; `null` outside any.
   */
  bracket: number | null;
}

/** A section's folder in the page list (a copy a repeat made has its own id and name). */
export interface FolderRow extends TreeRow {
  kind: "folder";
  placed: StartingSection;
  /** A copy a repeat made (`placed.section.id` isn't `placed.from`): no section actions. */
  copy: boolean;
  /** Its printed pages' numbers ("5–16"), empty when none are numbered. */
  range: string;
  /** Its made pages' slot ids, its subsections' included, in order. */
  slots: string[];
  collapsed: boolean;
}

/** A printed side (a page, or a blank page the layout added) in the page list. */
export interface SideRow extends TreeRow {
  kind: "side";
  side: BookSide;
  /** Its place among the layout's sides. */
  index: number;
}

/** A book spread's heading, before its first side. */
export interface SpreadRow extends TreeRow {
  kind: "spread";
  spread: readonly number[];
}

/** The pending pages of a run in a row ("+36 pages at export"): counted, not made, not selectable. */
export interface PendingRow extends TreeRow {
  kind: "pending";
  /** Its first page's (made-up) slot id, as the row's key. */
  first: string;
  count: number;
}

/** A template page whose list is empty for its row: it stays on the canvas but doesn't print. */
export interface NotPrintedRow extends TreeRow {
  kind: "notPrinted";
  page: BrochurePage;
}

/** A row of the page list, in order, with how far it's indented. */
export type PageTreeRow = FolderRow | SideRow | SpreadRow | PendingRow | NotPrintedRow;
