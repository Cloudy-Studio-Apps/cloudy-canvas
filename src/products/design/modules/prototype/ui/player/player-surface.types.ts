import type { Ref } from "react";

import type { PlayerSurface } from "./player-surfaces.types";
import type { ScreenPictures } from "./screen-pictures";

export interface PlayerSurfaceViewProps {
  surface: PlayerSurface;
  pictures: ScreenPictures;
  /** Pixels per world unit its picture is drawn at. */
  scale: number;
  hints: boolean;
  /** `page` on an overlay's screen, so its transitions find it. */
  part?: "page";
  ref?: Ref<HTMLDivElement>;
}
