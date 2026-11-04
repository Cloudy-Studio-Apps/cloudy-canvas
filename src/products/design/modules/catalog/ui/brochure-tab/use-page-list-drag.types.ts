import type { RowDrag } from "@canvas-ui";
import type { PageListSelection } from "../hooks/use-page-list-selection.types";
import type { FolderRow } from "./page-tree.types";

export interface PageListDragInput {
  list: PageListSelection;
  /** The folders shown, by section id. */
  folders: ReadonlyMap<string, FolderRow>;
}

export interface PageListDrag {
  rowDrag: RowDrag;
  /** The pages the drag on carries (their slot ids). */
  carried: ReadonlySet<string>;
  /** What the drag ghost says, empty while nothing's dragged. */
  ghost: string;
}
