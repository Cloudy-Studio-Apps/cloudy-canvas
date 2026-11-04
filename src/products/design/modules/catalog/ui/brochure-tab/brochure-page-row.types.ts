import type { RowDrag } from "@canvas-ui";
import type { BlankReason } from "../../model/book-layout.types";
import type { BrochurePage } from "../../model/brochure-pages.types";
import type { PageClick } from "../hooks/use-page-list-selection.types";

export interface BrochurePageRowProps {
  page: BrochurePage;
  /** Its printed page numbers ("4", "6–7"). */
  label: string;
  /** Whether it's among the selected pages. */
  selected: boolean;
  /** Whether it lists its options (it's the one page selected). */
  expanded: boolean;
  /** Whether it's carried by the drag on (one of several selected pages dragged). */
  carried: boolean;
  /** A click on it, with its modifier keys. */
  onClick: (event: PageClick) => void;
  /** The list's row drag. */
  rowDrag: RowDrag;
}

export interface BrochureOptionsListProps {
  page: BrochurePage;
}

export interface BlankPageRowProps {
  /** Its page number (counted, though a blank page doesn't print it). */
  number: string;
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

export interface SectionHeadingRowProps {
  /** The section's name. */
  name: string;
}
