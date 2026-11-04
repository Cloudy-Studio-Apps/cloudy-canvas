import type { ApplyRepeat } from "./use-set-repeat.types";

export interface RepeatStartProps {
  frameId: string;
  /** Whether the frame has a layer to repeat. */
  hasLayer: boolean;
  apply: ApplyRepeat;
}
