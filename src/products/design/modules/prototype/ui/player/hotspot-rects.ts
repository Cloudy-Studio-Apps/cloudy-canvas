import type { FrameElement } from "../../../frame";
import type { DesignWorkspace } from "../../../../design-engine.types";
import { nodeInteractions } from "../../model";
import type { HotspotRect } from "./hotspot-rects.types";

/**
 * The layers of a screen the player reacts to: every member of it (`withMembers`, the screen
 * itself left out) with interactions and not hidden, bottom to top, where the scene puts them
 * (`getElement`), relative to the screen. `workspace` is on the screen's page: the user's engine,
 * or the player's own workspace.
 */
export function hotspotRects(workspace: DesignWorkspace, screen: FrameElement): HotspotRect[] {
  const members = workspace.withMembers([screen.id], "move");
  const at = workspace.getElement(screen.id) ?? screen;
  const rects: HotspotRect[] = [];
  for (const { id } of workspace.elements()) {
    if (id === screen.id || !members.has(id)) continue;
    const el = workspace.getElement(id);
    if (!el || isHidden(el) || nodeInteractions(el).length === 0) continue;
    rects.push({ id, rect: { x: el.x - at.x, y: el.y - at.y, w: el.w, h: el.h } });
  }
  return rects;
}

function isHidden(el: object): boolean {
  return "visible" in el && el.visible === false;
}
