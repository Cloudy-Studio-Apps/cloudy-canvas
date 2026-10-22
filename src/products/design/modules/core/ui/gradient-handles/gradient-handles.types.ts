import type { PointerEvent as ReactPointerEvent } from "react";

import type { Point } from "@canvas";

/** A handle of a gradient on the canvas: one of its ends, or a stop (by index in `stops`). */
export type GradientGrip = "start" | "end" | "width" | { stop: number };

/** How the canvas maps world points to the overlay's: `screen = origin + world × zoom`. */
export interface ViewMapping {
  origin: Point;
  zoom: number;
}

/** Where a node's normalized box lies: its corner, size and turn (degrees counterclockwise). */
export interface NodeFrame {
  x: number;
  y: number;
  w: number;
  h: number;
  rotation: number;
}

export interface EndHandleProps {
  /** Where it's drawn on the overlay. */
  at: Point;
  label: string;
  /** Drawn smaller (the width handle). */
  small?: boolean;
  onPointerDown: (event: ReactPointerEvent<SVGElement>) => void;
}
