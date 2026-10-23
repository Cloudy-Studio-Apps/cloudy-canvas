import type { Matrix } from "pixi.js";

import type { Point, Rect } from "../../geometry.types";

/** Where a scope's filter is drawn, for its `EffectPass`. */
export interface EffectPassFrame {
  /** CSS pixels per world unit. */
  scale: number;
  /** The element's turn, degrees counterclockwise round its corner. */
  rotation: number;
  /** The element's own box (unturned, world units). */
  box: Rect;
  /** The filter area's corner, in the space the scope's transform maps world units into. */
  origin: Point;
  /** The scope's world transform. */
  transform: Matrix;
}
