import type { PrototypeFlowElement } from "../../model";
import type { PlayerRun } from "./player-run";

export interface PlayerBarProps {
  flow: PrototypeFlowElement;
  /** The flows of its page, which the picker switches between. */
  flows: readonly PrototypeFlowElement[];
  run: PlayerRun;
  /** There's a screen or an overlay to go back from. */
  canGoBack: boolean;
  /** The hotspots are kept shown. */
  pinned: boolean;
  onToggleHints: () => void;
  onClose: () => void;
}
