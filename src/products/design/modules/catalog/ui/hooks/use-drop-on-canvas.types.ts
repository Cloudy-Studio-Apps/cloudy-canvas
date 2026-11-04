import type { Point } from "@canvas";
import type { PointerEvent as ReactPointerEvent } from "react";

import type { PageItemTarget } from "../../model/page-items/page-item-definition.types";

export interface DropOnCanvasOptions {
  /** The page under a world point, `null` for none. */
  targetAt: (world: Point) => PageItemTarget | null;
  /** A row `id` dropped on `target` at world point `at`. */
  onDrop: (id: string, target: PageItemTarget, at: Point) => void;
}

/** A row dragged out of a list, onto the canvas. */
export interface CanvasDragState {
  id: string;
  /** The pointer, in client pixels. */
  pointer: Point;
  /** Whether it's over a page it can drop on. */
  over: boolean;
}

export interface DropOnCanvas {
  /** The drag on, `null` when none is. */
  drag: CanvasDragState | null;
  /** What a row puts on the element it drags from. */
  grabProps: (id: string) => {
    onPointerDown: (event: ReactPointerEvent<HTMLElement>) => void;
  };
}
