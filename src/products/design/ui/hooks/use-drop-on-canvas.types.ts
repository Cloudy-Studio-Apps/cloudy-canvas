import type { PointerEvent as ReactPointerEvent } from "react";

import type { Point } from "@canvas";

export interface DropOnCanvasOptions<P, T> {
  /**
   * What is under a world point that takes the drop, `null` for nothing (the ghost greys and a
   * release there drops nothing). Without it any point of the canvas takes the drop and the
   * target is the world point itself (so `T` must be `Point`).
   */
  targetAt?: (world: Point) => T | null;
  /** A `payload` dropped on `target` at world point `at`. */
  onDrop: (payload: P, target: T, at: Point) => void;
}

/** A payload dragged out of a panel, onto the canvas. */
export interface CanvasDragState<P> {
  payload: P;
  /** The pointer, in client pixels. */
  pointer: Point;
  /** Whether it's over something it can drop on. */
  over: boolean;
}

export interface DropOnCanvas<P> {
  /** The drag on, `null` when none is. */
  drag: CanvasDragState<P> | null;
  /** What an element spreads to be dragged with `payload`. */
  grabProps: (payload: P) => {
    onPointerDown: (event: ReactPointerEvent<HTMLElement>) => void;
  };
}
