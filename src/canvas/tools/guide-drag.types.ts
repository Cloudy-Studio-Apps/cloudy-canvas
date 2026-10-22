import type { Rect } from "../geometry.types";

/** A frame a ruler guide can belong to: its element's id and bounds. */
export interface GuideFrame {
  id: string;
  bounds: Rect;
}
