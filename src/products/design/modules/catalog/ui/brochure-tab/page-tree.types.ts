import type { BookSide } from "../../model/book-layout.types";
import type { PlacedSection } from "../../model/sections/sections.types";

/** A section's folder in the page list. */
export interface FolderRow {
  kind: "folder";
  placed: PlacedSection;
  depth: number;
  /** Its printed pages' numbers ("5–16"), empty when none are numbered. */
  range: string;
  /** Its pages' slot ids, its subsections' included, in order. */
  slots: string[];
  collapsed: boolean;
}

/** A printed side (a page, or a blank page the layout added) in the page list. */
export interface SideRow {
  kind: "side";
  side: BookSide;
  /** Its place among the layout's sides. */
  index: number;
  depth: number;
}

/** A book spread's heading, before its first side. */
export interface SpreadRow {
  kind: "spread";
  spread: readonly number[];
  depth: number;
}

/** A row of the page list, in order, with how far it's indented. */
export type PageTreeRow = FolderRow | SideRow | SpreadRow;
