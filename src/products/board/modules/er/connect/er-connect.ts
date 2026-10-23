import type {
  ElementHandle,
  ElementInteraction,
  ElementSide,
  InteractionQuery,
  Point,
} from "@canvas";

import type { BoardToolOptions } from "../../../board-options.types";
import { CONNECTOR_DEFAULTS } from "../../connector/connector.defaults";
import { SIDE_DIRECTIONS, SIDES } from "../../connector/sides";
import { ErConnectGesture } from "./er-connect.gesture";
import type { ErElement } from "../base/er.types";
import type { ErAnchorOf, ErConnectSource } from "./er-connect.types";

/** A dot beside each side of a selected or hovered entity, relation or hierarchy. */
export function erConnectHandles(zoom: number, anchor: ErAnchorOf): ElementHandle[] {
  return SIDES.map((side) => ({ ...dotPoint(side, zoom, anchor), look: "dot" as const }));
}

/**
 * Dragging a dot links the element to what it's dropped on (`ErConnectGesture`): a relation
 * between two entities, a participant, a hierarchy's child, or an attribute on empty space.
 */
export function erConnectInteraction(
  el: ErConnectSource,
  p: Point,
  query: InteractionQuery,
  anchor: ErAnchorOf,
): ElementInteraction<BoardToolOptions> | null {
  if (!query.selected && !query.hovered) return null;
  const reach = CONNECTOR_DEFAULTS.quickConnectRadius / query.zoom;
  const side = SIDES.find((s) => {
    const q = dotPoint(s, query.zoom, anchor);
    return Math.hypot(p.x - q.x, p.y - q.y) <= reach;
  });
  if (!side) return null;
  return {
    cursor: "crosshair",
    press: (ctx, pointer) => new ErConnectGesture(ctx, el, anchor(side), pointer),
  };
}

function dotPoint(side: ElementSide, zoom: number, anchor: ErAnchorOf): Point {
  const at = anchor(side);
  const dir = SIDE_DIRECTIONS[side];
  const offset = CONNECTOR_DEFAULTS.quickConnectOffset / zoom;
  return { x: at.x + dir.x * offset, y: at.y + dir.y * offset };
}

/** Whether the ER element has connect dots (entities, relations, hierarchies). */
export function isErConnectSource(el: ErElement | undefined): el is ErConnectSource {
  return (
    el?.type === "er-entity" ||
    el?.type === "er-relation" ||
    el?.type === "er-isa" ||
    el?.type === "er-union"
  );
}
