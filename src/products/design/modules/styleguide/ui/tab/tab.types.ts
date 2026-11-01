import type { RowDrag } from "@canvas-ui";
import type { StyleguideOutlineEntry } from "../../model/design-styleguide.types";

export interface CategoryRowProps {
  entry: StyleguideOutlineEntry;
  /** The list's row drag. */
  rowDrag: RowDrag;
}

export interface GroupRowProps {
  entry: StyleguideOutlineEntry;
  groupId: string;
  title: string;
  count: number;
  /** Hidden from the view. */
  hidden: boolean;
}
