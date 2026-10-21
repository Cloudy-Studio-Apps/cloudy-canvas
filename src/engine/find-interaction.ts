import { kindOf } from "./elements";
import type { Point } from "./geometry.types";
import { resizeHandleAt, type Interaction } from "./handles";
import type { Scene } from "./scene";

/** Handle grab radius, in screen px. */
const HANDLE_REACH_PX = 6;

/**
 * What a press at `world` would grab: a resize handle of the single selected element. Handles
 * only exist where the overlay draws them.
 */
export function findInteraction(scene: Scene, world: Point, zoom: number): Interaction | null {
  const reach = HANDLE_REACH_PX / zoom;
  const id = scene.selection.single();
  const element = id ? scene.get(id) : undefined;
  if (!element || !kindOf(element).resizable) return null;
  const handle = resizeHandleAt(kindOf(element).bounds(element), world, reach);
  return handle ? { kind: "resize", element, handle } : null;
}
