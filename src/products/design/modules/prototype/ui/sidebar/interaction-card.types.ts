import type { PrototypeInteraction } from "../../model";
import type { ScreenChoice } from "./interaction-fields.types";

export interface InteractionCardProps {
  ix: PrototypeInteraction;
  screens: readonly ScreenChoice[];
  /** Names a screen by id, for the summary. */
  screenName: (id: string) => string;
  onChange: (patch: Partial<PrototypeInteraction>) => void;
  onRemove: () => void;
}
