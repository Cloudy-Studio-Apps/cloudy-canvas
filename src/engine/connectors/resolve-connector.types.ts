import type { Shape } from "../document";
import type { Point } from "../geometry.types";

export type ShapeLookup = (id: string) => Shape | undefined;

export interface ResolvedEnd {
  point: Point;
  /** Outward direction of the side it leaves from; `null` for a free end. */
  dir: Point | null;
}
