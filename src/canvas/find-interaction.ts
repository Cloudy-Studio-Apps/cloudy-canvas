import type { Point } from "./geometry.types";
import { resizeHandleAt, resizeTarget, rotateZoneAt, type Interaction } from "./handles";
import { toUnrotated } from "./rotation";
import type { Scene } from "./scene";

/** Handle grab radius, in screen px. */
const HANDLE_REACH_PX = 6;
/** How far past a corner of the selection a press turns it, in screen px. */
const ROTATE_REACH_PX = 18;

/**
 * What a press at `world` would grab, in priority order: a resize handle of the selection (one
 * element, or the box round several), then whatever an element's kind offers there (topmost
 * first), then the rotate zone just outside a corner of the selection (when it can turn). Handles
 * only exist where the overlay draws them. Locked elements offer nothing.
 */
export function findInteraction(scene: Scene, world: Point, zoom: number): Interaction | null {
  const reach = HANDLE_REACH_PX / zoom;
  const selected = [...scene.selection.ids].map((id) => scene.get(id));
  const target = resizeTarget(
    selected.filter((el) => el !== undefined),
    scene.kinds,
    scene.resizeMode,
  );
  if (target?.resizable) {
    const handle = resizeHandleAt(target.box, world, reach, target.rotation);
    if (handle) return { kind: "resize", target, handle };
  }

  const elements = scene.elements;
  for (let i = elements.length - 1; i >= 0; i--) {
    const element = elements[i]!;
    if (element.locked) continue;
    const interaction = scene.kindOf(element).interactionAt(element, toUnrotated(world, element), {
      reach,
      zoom,
      selected: scene.selection.has(element.id),
      hovered: scene.hoveredId === element.id,
    });
    if (interaction) return { kind: "element", element, interaction };
  }

  const corner = target && rotateZoneAt(target, scene.kinds, world, ROTATE_REACH_PX / zoom);
  return target && corner ? { kind: "rotate", target, corner } : null;
}
