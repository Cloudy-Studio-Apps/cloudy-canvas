import type { Rect } from "@canvas";

import type { OverlayEntry, PrototypeInteraction } from "../../model";
import type { PlayerRun } from "./player-run";
import type { PlayerSurfaces } from "./player-surfaces.types";

export interface TriggerOptions {
  run: PlayerRun;
  /** The device's scaled layer, which the pointer is read against; `null` until it's drawn. */
  box: HTMLElement | null;
  surfaces: PlayerSurfaces;
  /** CSS pixels per world unit. */
  scale: number;
  /** A click on nothing that reacts to it. */
  onMiss: () => void;
}

/** An overlay a hover or a press opened, to close when it's let go. */
export interface TriggerHold {
  kind: "hover" | "press";
  entry: OverlayEntry;
  /** The hotspot that opened it (device units): leaving it (and the overlay) lets go of a hover. */
  rect: Rect;
}

/** What the pointer is doing in the player, kept between events. */
export interface PointerTrack {
  /** The surface `inside` is about (its key). */
  surface: string | null;
  /** The targets the pointer is over. */
  inside: Set<string>;
  holds: TriggerHold[];
  pressing: boolean;
  /** A press on a target with a drag interaction, until it moves 12 px or is let go. */
  drag: { x: number; y: number; ix: PrototypeInteraction } | null;
  /** The press became a drag: its click is ignored. */
  dragged: boolean;
}
