import type { Point } from "@canvas";

/** Cubic bezier between two column anchors. `startDir`/`endDir` are the outward x directions. */
export interface RelationPath {
  start: Point;
  c1: Point;
  c2: Point;
  end: Point;
  startDir: 1 | -1;
  endDir: 1 | -1;
}
