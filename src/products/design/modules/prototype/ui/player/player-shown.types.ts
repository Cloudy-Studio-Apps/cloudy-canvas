import type { Size } from "@canvas";

import type { PrototypeFlowElement } from "../../model";
import type { PlayerSurfaces } from "./player-surfaces.types";

/** What the player draws for a session. */
export interface PlayerShown {
  flow: PrototypeFlowElement;
  /** The flows of its page, in order (the bar's picker). */
  flows: PrototypeFlowElement[];
  /** The device's screen size (world units). */
  device: Size;
  surfaces: PlayerSurfaces;
  /** A browser's address: `<page name>/<screen name, slugged>`. */
  address: string;
}
