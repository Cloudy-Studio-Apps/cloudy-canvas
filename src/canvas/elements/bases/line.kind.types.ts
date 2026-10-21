import type { CanvasElement } from "../element.types";

/** Elements drawn along a polyline: `points` is a flat [x0, y0, x1, y1, …] list, relative to (x, y). */
export type LineElement = CanvasElement & { points: number[] };
