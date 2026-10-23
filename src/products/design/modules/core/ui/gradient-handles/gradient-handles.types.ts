import type { PointerEvent as ReactPointerEvent } from "react";

import type { Point } from "@canvas";

/** A handle of a gradient on the canvas: one of its ends, or a stop (by index in `stops`). */
export type GradientGrip = "start" | "end" | "width" | { stop: number };

export interface EndHandleProps {
  /** Where it's drawn on the overlay. */
  at: Point;
  label: string;
  /** Drawn smaller (the width handle). */
  small?: boolean;
  onPointerDown: (event: ReactPointerEvent<SVGElement>) => void;
}
