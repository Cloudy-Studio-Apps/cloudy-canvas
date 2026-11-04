import type { BrochurePage } from "../../model/brochure-pages.types";

/** The modifier keys of a click on a page row. */
export interface PageClick {
  ctrlKey: boolean;
  metaKey: boolean;
  shiftKey: boolean;
}

/** The Brochure tab's selection of pages, which is the canvas's selection of their frames. */
export interface PageListSelection {
  /** The selected pages' slot ids. */
  selected: ReadonlySet<string>;
  /** A click on a page row: shows it, Ctrl/⌘ adds or takes it out, Shift selects a range. */
  click: (page: BrochurePage, event: PageClick) => void;
  /** The pages a drag of `slotId` carries: every selected page when it's one, else it alone. */
  draggedFor: (slotId: string) => string[];
}
