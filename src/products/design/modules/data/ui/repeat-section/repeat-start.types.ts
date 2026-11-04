import type { ApplyRepeat } from "./use-set-repeat.types";

export interface RepeatStartProps {
  frameId: string;
  /** The card chosen to repeat; unset when the frame has no layer. */
  cardId: string | undefined;
  apply: ApplyRepeat;
}
