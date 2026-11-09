import type { Rect } from "@canvas";

import type { FrameElement } from "../../../frame";
import type { OverlayEntry, PrototypeInteraction } from "../../model";
import type { HotspotRect } from "./hotspot-rects.types";

/** Something the player reacts to: a hotspot, or a screen itself. */
export interface PlayerTarget {
  id: string;
  /** Where it is in the device, in world units from its top-left corner. */
  rect: Rect;
  interactions: PrototypeInteraction[];
}

/** A screen as the player shows it: the one under the overlays, or an overlay. */
export interface PlayerSurface {
  /** Tells what's shown apart: a new one is a new key (its React key, what its timers follow). */
  key: string;
  screen: FrameElement;
  /** Where it is in the device (world units). */
  rect: Rect;
  /** Its hotspots, bottom to top, relative to the screen (what `Hotspots` draws). */
  hotspots: HotspotRect[];
  /** What reacts on it: its hotspots topmost first, then the screen itself. */
  targets: PlayerTarget[];
  /** The overlay it shows, `null` for the screen under the overlays. */
  overlay: OverlayEntry | null;
}

/** What the player shows: the screen and the open overlays, bottom to top. */
export interface PlayerSurfaces {
  base: PlayerSurface | null;
  overlays: PlayerSurface[];
}
