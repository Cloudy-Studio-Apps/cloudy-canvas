import type { Rect } from "../geometry.types";

/** A frame a ruler guide can belong to: its element's id and bounds. */
export interface GuideFrame {
  id: string;
  /** Its unturned bounds. */
  bounds: Rect;
  /** Its turn, round the bounds' corner (degrees counterclockwise). */
  rotation: number;
}
