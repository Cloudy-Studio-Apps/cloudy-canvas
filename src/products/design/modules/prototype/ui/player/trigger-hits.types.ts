import type { PrototypeInteraction } from "../../model";
import type { PlayerTarget } from "./player-surfaces.types";

/** The first target with an interaction of some trigger, and that interaction. */
export interface TargetHit {
  target: PlayerTarget;
  ix: PrototypeInteraction;
}
