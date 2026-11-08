import type { PrototypeInteraction, PrototypeTransition } from "./interaction.types";

/** A screen the player went through and the transition that showed it (`null` for the first). */
export interface PlayerEntry {
  screen: string;
  via: PrototypeTransition | null;
}

/** An open overlay: its screen and the interaction that opened it. */
export interface OverlayEntry {
  screen: string;
  interaction: PrototypeInteraction;
}

/** Where the player is: the flow, the screens visited (the last is shown) and the open overlays. */
export interface PlayerState {
  flow: string;
  stack: PlayerEntry[];
  overlays: OverlayEntry[];
}

/** What the player has to animate after an interaction. */
export type PlayerStep =
  | { kind: "none" }
  | { kind: "screen"; from: string; to: string; transition: PrototypeTransition }
  | { kind: "openOverlay"; entry: OverlayEntry }
  | { kind: "closeOverlay"; entry: OverlayEntry }
  | { kind: "swapOverlay"; from: OverlayEntry; to: OverlayEntry }
  | { kind: "link"; url: string };

export interface PlayerResult {
  state: PlayerState;
  step: PlayerStep;
}
