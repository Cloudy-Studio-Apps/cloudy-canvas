import type { CanvasElement } from "@canvas";

import { isDesignNode } from "../../../core";
import type { FrameElement } from "../../../frame";
import type { DesignWorkspace } from "../../../../design-engine.types";
import { nodeInteractions } from "../../model";
import type { HotspotRect } from "./hotspot-rects.types";

/**
 * The layers of a screen the player reacts to: every member of it (`withMembers`, the screen
 * itself left out) with interactions and shown (neither it nor a parent up to the screen is
 * hidden), bottom to top, where the scene puts them (`getElement`), relative to the screen.
 * `workspace` is on the screen's page: the user's engine, or the player's own workspace.
 */
export function hotspotRects(workspace: DesignWorkspace, screen: FrameElement): HotspotRect[] {
  const members = workspace.withMembers([screen.id], "move");
  const at = workspace.getElement(screen.id) ?? screen;
  const rects: HotspotRect[] = [];
  for (const { id } of workspace.elements()) {
    if (id === screen.id || !members.has(id)) continue;
    const el = workspace.getElement(id);
    if (!el || nodeInteractions(el).length === 0 || isHidden(workspace, el, screen.id)) continue;
    rects.push({ id, rect: { x: el.x - at.x, y: el.y - at.y, w: el.w, h: el.h } });
  }
  return rects;
}

/** Whether a layer or one of its parents below the screen is hidden. */
function isHidden(workspace: DesignWorkspace, el: CanvasElement, screen: string): boolean {
  const seen = new Set<string>();
  let node: CanvasElement | undefined = el;
  while (node && node.id !== screen && !seen.has(node.id)) {
    if (!isDesignNode(node)) return false;
    if (!node.visible) return true;
    seen.add(node.id);
    node = node.parentId === null ? undefined : workspace.getElement(node.parentId);
  }
  return false;
}
