import type { PlayTarget } from "../../model";

/** Whether the player is open and what it plays (UI state only). */
export interface PlayerStoreState {
  /** The flow playing (and the screen it began at), `null` while the player is closed. */
  target: PlayTarget | null;
  open: (target: PlayTarget) => void;
  close: () => void;
}
