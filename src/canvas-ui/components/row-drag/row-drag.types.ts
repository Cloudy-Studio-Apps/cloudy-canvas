import type { PointerEvent } from "react";

/** Which half of a row the pointer is over: a dropped row goes before or after it. */
export type RowDropSide = "before" | "after";

export interface RowDragState {
  id: string;
  /** The target under the pointer that takes this row; `null` for none. */
  overId: string | null;
  side: RowDropSide;
  pointer: { x: number; y: number };
}

export interface RowDragOptions {
  onDrop: (id: string, overId: string, side: RowDropSide) => void;
  /** Whether `overId` takes this row. Everything but the row itself when left out. */
  canDrop?: (id: string, overId: string) => boolean;
}

export interface RowDrag {
  drag: RowDragState | null;
  /** Spread on what starts the drag: a row, or its grip. */
  grabProps: (
    id: string,
    enabled?: boolean,
  ) => { onPointerDown: (event: PointerEvent<HTMLElement>) => void };
  /** Spread on what takes a drop: a row, or a whole group. */
  dropProps: (id: string) => { "data-row-drop": string; "data-row-drop-scope": string };
}

export interface RowDropTarget {
  id: string;
  side: RowDropSide;
}
