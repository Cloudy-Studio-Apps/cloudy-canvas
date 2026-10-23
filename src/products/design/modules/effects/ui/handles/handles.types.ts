import type { PointerEvent as ReactPointerEvent } from "react";

import type { Point } from "@canvas";
import type { OverlayFrame, ViewMapping } from "@canvas-ui";
import type { NodeEffect } from "@design";

/** Starts dragging a handle: `onMove` gets the pointer in the layer's box (0–1 each axis). */
export type StartHandleDrag = (
  event: ReactPointerEvent<SVGElement>,
  onMove: (p: Point, event: PointerEvent) => void,
) => void;

/** What each effect's handles get: the effect, its layer's box on screen, and how to change it. */
export interface EffectHandlesProps<E extends NodeEffect> {
  effect: E;
  frame: OverlayFrame;
  view: ViewMapping;
  /** The layer's box point (0–1) on the overlay. */
  screen: (p: Point) => Point;
  startDrag: StartHandleDrag;
  /** `first` starts a new undo step (the first move of a drag). */
  change: (next: E, first: boolean) => void;
}

export interface HandleDotProps {
  at: Point;
  label: string;
  onPointerDown: (event: ReactPointerEvent<SVGElement>) => void;
}
