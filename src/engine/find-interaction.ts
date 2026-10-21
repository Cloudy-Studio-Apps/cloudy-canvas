import { connectorEndpoints } from "./connectors";
import { handleAt } from "./db";
import { isConnector, isDbTable, type BoardDocument } from "./document";
import type { Point } from "./geometry.types";
import {
  canQuickConnect,
  isResizable,
  quickConnectAt,
  resizeHandleAt,
  type Interaction,
} from "./handles";
import type { Scene } from "./scene";

/** Handle grab radius, in screen px. */
const HANDLE_REACH_PX = 6;

/**
 * What a press at `world` would grab, in priority order: a selected connector's end, a resize
 * handle, a quick-connect dot, a database column handle. Handles only exist on the selected or
 * hovered shapes, matching what the overlay draws.
 */
export function findInteraction(
  doc: BoardDocument,
  scene: Scene,
  world: Point,
  zoom: number,
): Interaction | null {
  const reach = HANDLE_REACH_PX / zoom;
  const selected = [...scene.selection.ids];

  for (const id of selected) {
    const connector = scene.get(id);
    const raw = doc.get(id);
    if (!isConnector(connector) || !isConnector(raw)) continue;
    const ends = connectorEndpoints(connector);
    for (const which of ["end", "start"] as const) {
      if (Math.hypot(world.x - ends[which].x, world.y - ends[which].y) <= reach) {
        return { kind: "endpoint", connector: raw, which };
      }
    }
  }

  const single = scene.selection.single();
  const singleShape = single ? scene.get(single) : undefined;
  if (isResizable(singleShape)) {
    const handle = resizeHandleAt(singleShape, world, reach);
    if (handle) return { kind: "resize", shape: singleShape, handle };
  }

  const hovered = scene.hoveredId ? scene.get(scene.hoveredId) : undefined;
  for (const shape of [singleShape, hovered]) {
    if (!canQuickConnect(shape)) continue;
    const side = quickConnectAt(shape, world, zoom);
    if (side) return { kind: "quick-connect", shape, side };
  }

  const candidates = new Set(selected);
  if (scene.hoveredId) candidates.add(scene.hoveredId);
  const shapes = scene.shapes;
  for (let i = shapes.length - 1; i >= 0; i--) {
    const shape = shapes[i]!;
    if (!isDbTable(shape) || !candidates.has(shape.id)) continue;
    const hit = handleAt(shape, world, reach);
    if (hit) return { kind: "column", handle: { table: shape, ...hit } };
  }
  return null;
}
