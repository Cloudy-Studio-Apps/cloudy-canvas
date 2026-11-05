import type { ScopeLayer } from "../../repeat";
import type { CardLoopPreview } from "./card-loop-preview.types";

export interface InScopeRowProps {
  /** The loop: its row's name, its row's place and its count. */
  layer: ScopeLayer;
  /** Where it comes from and its stepper, when the layer shows its preview. */
  loop: CardLoopPreview;
}
