import type { Size } from "@canvas";

import type { PrototypeFlowElement } from "../../model";
import type { PlayerRun } from "./player-run";
import type { PlayerSurfaces } from "./player-surfaces.types";
import type { ScreenPictures } from "./screen-pictures";

export interface PlayerStageProps {
  flow: PrototypeFlowElement;
  run: PlayerRun;
  surfaces: PlayerSurfaces;
  /** The device's screen size (world units). */
  device: Size;
  /** What a browser's address bar shows. */
  address: string;
  pictures: ScreenPictures;
  hints: boolean;
  /** A click on nothing that reacts. */
  onMiss: () => void;
}
