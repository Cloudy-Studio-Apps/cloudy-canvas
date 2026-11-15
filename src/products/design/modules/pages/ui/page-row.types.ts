import type { RowDrag } from "@canvas-ui";
import type { PageElement } from "../page/page.types";

export interface PageRowProps {
  page: PageElement;
  current: boolean;
  /** Whether it can be deleted (it isn't the only page). */
  deletable: boolean;
  /** Whether it can be split into a new file (it isn't the only page). */
  splittable: boolean;
  /** The list's row drag. */
  rowDrag: RowDrag;
}

export interface PageMenuProps {
  page: PageElement;
  deletable: boolean;
  splittable: boolean;
  /** Whether the menu is open (the row's right-click opens it too). */
  open: boolean;
  onOpenChange(open: boolean): void;
  onRename(): void;
}
