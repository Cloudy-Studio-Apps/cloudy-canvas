import type { RowDrag } from "@canvas-ui";
import type { PageElement } from "../page/page.types";

export interface PageRowProps {
  page: PageElement;
  current: boolean;
  /** Whether it can be deleted (it isn't the only page). */
  deletable: boolean;
  /** The list's row drag. */
  rowDrag: RowDrag;
}

export interface PageMenuProps {
  page: PageElement;
  deletable: boolean;
  onRename(): void;
}
