import type { Matrix } from "pixi.js";

import type { Point } from "../../geometry.types";

/** A point taken through a transform (the path's own when `m` is left out). */
export type At = (x: number, y: number, m?: Matrix | null) => Point;
