import type { PointerEvent } from "react";

/** Handlers for the element the user drags on. */
export interface PointerDragHandlers {
  onPointerDown: (event: PointerEvent<HTMLElement>) => void;
  onPointerMove: (event: PointerEvent<HTMLElement>) => void;
  onPointerUp: (event: PointerEvent<HTMLElement>) => void;
  onPointerCancel: (event: PointerEvent<HTMLElement>) => void;
}

/** Where the pointer is in the dragged element, from 0 to 1 on each axis (clamped). */
export interface DragPosition {
  x: number;
  y: number;
}
