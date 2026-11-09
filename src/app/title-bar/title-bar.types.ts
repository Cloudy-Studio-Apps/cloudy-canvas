import type { FileTab } from "@canvas";
import type { RowDragState } from "@canvas-ui";

export interface TabButtonProps {
  tab: FileTab;
  active: boolean;
  /** Where a dragged tab would land relative to this one, for the drop line. */
  dropSide: "before" | "after" | null;
  /** Whether this tab is the one being dragged. */
  dragging: boolean;
  /** Spread on the tab: starts a drag, marks it as a drop target. */
  rowProps: Record<string, unknown>;
}

export interface HomeTabButtonProps {
  active: boolean;
}

export interface TabAvatarsProps {
  tab: FileTab;
  active: boolean;
}

export interface TabReorder {
  drag: RowDragState | null;
  /** Spread on a tab: starts its drag and marks it as a drop target. */
  rowProps: (id: string) => Record<string, unknown>;
  /** Which side of tab `id` a dragged tab would drop on, `null` when it isn't the target. */
  dropSideOf: (id: string) => "before" | "after" | null;
}
