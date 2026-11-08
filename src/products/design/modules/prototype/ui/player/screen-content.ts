import type { CanvasElement } from "@canvas";

import type { DesignWorkspace } from "../../../../design-engine.types";
import type { FrameElement } from "../../../frame";

/** The screen and every layer inside it, as the document holds them now. */
export function screenContent(
  workspace: DesignWorkspace,
  screen: FrameElement,
): readonly CanvasElement[] {
  return [...workspace.withMembers([screen.id], "move")].flatMap((id) => {
    const el = workspace.doc.get(id);
    return el ? [el] : [];
  });
}

/**
 * Whether a picture drawn from `drawn` still shows the screen: the same layers, each the very
 * object it was (the document replaces only the object of an element that changed, so an edit
 * anywhere inside the screen, a layer added or taken out included, fails this).
 */
export function stillShows(
  workspace: DesignWorkspace,
  drawn: readonly CanvasElement[],
  screen: FrameElement,
): boolean {
  const now = workspace.withMembers([screen.id], "move");
  return (
    now.size === drawn.length &&
    drawn.every((el) => now.has(el.id) && workspace.doc.get(el.id) === el)
  );
}
