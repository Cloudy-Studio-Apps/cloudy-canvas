import {
  TextBoxKind,
  type ElementHandle,
  type ElementInteraction,
  type InteractionQuery,
  type Point,
  type TextBoxElement,
} from "@canvas";

import type { BoardToolOptions } from "../../board-options.types";
import { CONNECTOR_DEFAULTS } from "./connector.defaults";
import { ConnectorDrag } from "./connector-drag";
import { SIDE_DIRECTIONS, SIDES } from "./sides";

/**
 * Text boxes (stickies, shapes) that show a quick-connect dot beside each side while selected or
 * hovered; dragging a dot draws a new connector from that side.
 */
export abstract class QuickConnectKind<E extends TextBoxElement> extends TextBoxKind<
  E,
  BoardToolOptions
> {
  override handles(el: E, zoom: number): ElementHandle[] {
    return SIDES.map((side) => ({ ...this.dotPoint(el, side, zoom), look: "dot" as const }));
  }

  override interactionAt(
    el: E,
    p: Point,
    query: InteractionQuery,
  ): ElementInteraction<BoardToolOptions> | null {
    if (!query.selected && !query.hovered) return null;
    const reach = CONNECTOR_DEFAULTS.quickConnectRadius / query.zoom;
    const side = SIDES.find((s) => {
      const q = this.dotPoint(el, s, query.zoom);
      return Math.hypot(p.x - q.x, p.y - q.y) <= reach;
    });
    if (!side) return null;
    return {
      cursor: "crosshair",
      press: (ctx, pointer) => {
        const anchor = this.anchor(el, side);
        const start = { shapeId: el.id, side, x: Math.round(anchor.x), y: Math.round(anchor.y) };
        ctx.setSelection([]);
        return new ConnectorDrag(ctx, { kind: "new", start }, pointer);
      },
    };
  }

  private dotPoint(el: E, side: (typeof SIDES)[number], zoom: number): Point {
    const anchor = this.anchor(el, side);
    const dir = SIDE_DIRECTIONS[side];
    const offset = CONNECTOR_DEFAULTS.quickConnectOffset / zoom;
    return { x: anchor.x + dir.x * offset, y: anchor.y + dir.y * offset };
  }
}
