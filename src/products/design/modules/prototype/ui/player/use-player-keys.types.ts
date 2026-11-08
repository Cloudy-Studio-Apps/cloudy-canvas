import type { PlayerRun } from "./player-run";
import type { PlayerSurfaces } from "./player-surfaces.types";

export interface PlayerKeysOptions {
  run: PlayerRun;
  surfaces: PlayerSurfaces;
  onClose: () => void;
  onToggleHints: () => void;
}
