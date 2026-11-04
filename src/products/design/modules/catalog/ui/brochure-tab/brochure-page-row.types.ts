import type { RowDrag } from "@canvas-ui";
import type { BlankReason } from "../../model/book-layout.types";
import type { BrochurePage } from "../../model/brochure-pages.types";

export interface BrochurePageRowProps {
  page: BrochurePage;
  /** Its printed page numbers ("4", "6–7"). */
  label: string;
  selected: boolean;
  /** The list's row drag. */
  rowDrag: RowDrag;
}

export interface BrochureOptionsListProps {
  page: BrochurePage;
}

export interface BlankPageRowProps {
  /** Its printed page number. */
  number: number;
  reason: BlankReason;
  /** The list's row drag: a page dropped on a blank takes its place. */
  rowDrag: RowDrag;
  /** Its id as a drop target. */
  dropId: string;
}

export interface SpreadHeadingRowProps {
  label: string;
  /** The list's row drag: a page dropped on a heading starts the spread (or is the back cover). */
  rowDrag: RowDrag;
  /** Its id as a drop target. */
  dropId: string;
}

export interface ListEndDropProps {
  /** The list's row drag: a page dropped after the last row goes last. */
  rowDrag: RowDrag;
}
