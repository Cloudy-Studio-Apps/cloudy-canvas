import {
  rectContainsPoint,
  type ElementInteraction,
  type ElementPatch,
  type InteractionQuery,
  type Point,
} from "@canvas";

import { ColumnConnectGesture } from "./column-connect.gesture";
import { handleAt } from "./db-table.layout";
import type { DbTableElement } from "./db-table.types";
import { noteBubbleLayout } from "./note-bubble.layout";

/**
 * What a press on a table grabs before selecting it: the × or icon that hides or shows its note
 * bubbles, or (on a selected or hovered table) a column handle to drag a relation out of.
 */
export function tableInteractionAt(
  table: DbTableElement,
  p: Point,
  { reach, selected, hovered }: InteractionQuery,
): ElementInteraction | null {
  const layout = noteBubbleLayout(table);
  const button = layout && (layout.hidden ? layout.icon : layout.close);
  if (layout && button && rectContainsPoint(button, p)) {
    return {
      cursor: "pointer",
      press: (ctx) => {
        // Showing or hiding notes is view state, so it isn't an undo step.
        const patch: ElementPatch<DbTableElement> = { noteHidden: !layout.hidden };
        ctx.doc.updateUntracked(table.id, patch);
        return null;
      },
    };
  }

  if (!selected && !hovered) return null;
  const handle = handleAt(table, p, reach);
  if (!handle) return null;
  return {
    cursor: "crosshair",
    press: (ctx, start) => new ColumnConnectGesture(ctx, { table, row: handle.row }, start),
  };
}
