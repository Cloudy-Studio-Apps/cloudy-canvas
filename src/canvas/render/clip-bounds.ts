import type { Rect } from "../geometry.types";
import { rotatedBounds } from "../rotation";
import type { ElementClip } from "./layer-placement.types";

/** The axis-aligned box round a clip's area. */
export function clipBounds(clip: ElementClip): Rect {
  return rotatedBounds(clip.rect, clip.rotation ?? 0);
}
