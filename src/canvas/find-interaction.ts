import type { Point } from "./geometry.types";
import { resizeHandleAt, resizeTarget, type Interaction } from "./handles";
import type { Scene } from "./scene";

/** Handle grab radius, in screen px. */
const HANDLE_REACH_PX = 6;

/**
 * What a press at `world` would grab, in priority order: a resize handle of the selection (one
 * element, or the box round several), then whatever an element's kind offers there (topmost
 * first). Handles only exist where the overlay draws them. Locked elements offer nothing.
 */
export function findInteraction(scene: Scene, world: Point, zoom: number): Interaction | null {
  const reach = HANDLE_REACH_PX / zoom;
  const selected = [...scene.selection.ids].map((id) => scene.get(id));
  const target = resizeTarget(
    selected.filter((el) => el !== undefined),
    scene.kinds,
  );
  if (target) {
    const handle = resizeHandleAt(target.box, world, reach);
    if (handle) return { kind: "resize", target, handle };
  }

  const elements = scene.elements;
  for (let i = elements.length - 1; i >= 0; i--) {
    const element = elements[i]!;
    if (element.locked) continue;
    const interaction = scene.kindOf(element).interactionAt(element, world, {
      reach,
      zoom,
      selected: scene.selection.has(element.id),
      hovered: scene.hoveredId === element.id,
    });
    if (interaction) return { kind: "element", element, interaction };
  }
  return null;
}
