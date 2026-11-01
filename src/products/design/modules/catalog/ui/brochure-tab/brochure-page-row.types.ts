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
}
