import type { CanvasDocument } from "@canvas";

import type { PrototypeSelection } from "./prototype-selection.types";
import { isScreen, screenOf } from "./screens";

/**
 * What the Prototype mode is about for a canvas selection: `flow` (a picked flow's id, or `null`)
 * while nothing is selected, else the one selected element as a screen or a layer on one; several
 * elements, or one on no screen, count as none.
 */
export function prototypeSelection(
  doc: CanvasDocument,
  ids: readonly string[],
  flow: string | null,
): PrototypeSelection {
  if (ids.length === 0) return flow ? { kind: "flow", id: flow } : { kind: "none" };
  const [id, ...others] = ids;
  if (id === undefined || others.length > 0) return { kind: "none" };
  const screen = screenOf(doc, id);
  if (!screen) return { kind: "none" };
  return isScreen(doc.get(id)) ? { kind: "screen", id } : { kind: "layer", id, screen: screen.id };
}
