import type { ElementKinds } from "../elements";
import type { Point } from "../geometry.types";
import { rotatePoint } from "../rotation";
import type { ResizeHandle, ResizeTarget } from "./handles.types";
import { resizeHandlePoint } from "./resize-handles";

const CORNERS: readonly ResizeHandle[] = ["nw", "ne", "se", "sw"];

/**
 * The corner whose rotate zone holds `p`: outside the target's (turned) box, within `reach` of
 * the corner, when everything in the target can turn. `null` otherwise.
 */
export function rotateZoneAt(
  target: ResizeTarget,
  kinds: ElementKinds,
  p: Point,
  reach: number,
): ResizeHandle | null {
  if (!target.elements.every((el) => kinds.kindOf(el).rotatable)) return null;
  const { box, rotation } = target;
  const q = rotatePoint(p, box, -rotation);
  const inside = q.x >= box.x && q.x <= box.x + box.w && q.y >= box.y && q.y <= box.y + box.h;
  if (inside) return null;
  return (
    CORNERS.find((corner) => {
      const c = resizeHandlePoint(box, corner);
      return Math.hypot(q.x - c.x, q.y - c.y) <= reach;
    }) ?? null
  );
}
