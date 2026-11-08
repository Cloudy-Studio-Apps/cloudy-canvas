import type { PlayerRun } from "./player-run";
import type { PlayerSurface } from "./player-surfaces.types";
import type { ScreenPictures } from "./screen-pictures";

export interface PlayerOverlayProps {
  /** An overlay's surface (its `overlay` is set). */
  surface: PlayerSurface;
  run: PlayerRun;
  pictures: ScreenPictures;
  scale: number;
  hints: boolean;
}
