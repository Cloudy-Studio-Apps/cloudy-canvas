import type { CanvasDocument, Point, Rect, Size } from "@canvas";

import type { DesignWorkspace } from "../../../../design-engine.types";
import { currentScreen, isScreen, nodeInteractions } from "../../model";
import type { OverlayEntry } from "../../model";
import { hotspotRects } from "./hotspot-rects";
import type { PlayerView } from "./player-run.types";
import type { PlayerSurface, PlayerSurfaces } from "./player-surfaces.types";

/**
 * What a session shows in a device of size `device`: its current screen at the top-left, and each
 * overlay centered across and placed by its position (top, center, bottom). A screen that's gone
 * shows nothing. `workspace` is on the flow's page.
 */
export function playerSurfaces(
  doc: CanvasDocument,
  workspace: DesignWorkspace,
  { state, epoch }: PlayerView,
  device: Size,
): PlayerSurfaces {
  const current = currentScreen(state);
  const baseKey = `${epoch}:screen${state.stack.length}:${current}`;
  const base = current === null ? null : surfaceOf(doc, workspace, baseKey, current, null, device);
  const overlays = state.overlays.flatMap((entry, index) => {
    const key = `${epoch}:overlay${index}:${entry.screen}`;
    const surface = surfaceOf(doc, workspace, key, entry.screen, entry, device);
    return surface ? [surface] : [];
  });
  return { base, overlays };
}

function surfaceOf(
  doc: CanvasDocument,
  workspace: DesignWorkspace,
  key: string,
  id: string,
  overlay: OverlayEntry | null,
  device: Size,
): PlayerSurface | null {
  const screen = doc.get(id);
  if (!isScreen(screen)) return null;
  const at = overlay ? overlayOrigin(overlay, screen, device) : { x: 0, y: 0 };
  const rect = { x: at.x, y: at.y, w: screen.w, h: screen.h };
  const hotspots = hotspotRects(workspace, screen);
  const targets = hotspots
    .map(({ id: layer, rect: local }) => ({
      id: layer,
      rect: moved(local, at),
      interactions: nodeInteractions(doc.get(layer)),
    }))
    .reverse();
  targets.push({ id: screen.id, rect, interactions: nodeInteractions(screen) });
  return { key, screen, rect, hotspots, targets, overlay };
}

/** Where an overlay's top-left corner goes: centered across, at the top, middle or bottom. */
function overlayOrigin(entry: OverlayEntry, screen: Size, device: Size): Point {
  const position = entry.interaction.overlay?.position ?? "center";
  const free = device.h - screen.h;
  return {
    x: (device.w - screen.w) / 2,
    y: position === "top" ? 0 : position === "bottom" ? free : free / 2,
  };
}

function moved(rect: Rect, by: Point): Rect {
  return { ...rect, x: rect.x + by.x, y: rect.y + by.y };
}
