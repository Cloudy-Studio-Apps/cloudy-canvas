import type { PrototypeInteraction } from "../../model";

/** What the fields of one interaction card share. */
export interface InteractionFieldsProps {
  ix: PrototypeInteraction;
  /** Writes a change of the interaction, one undo step. */
  onChange: (patch: Partial<PrototypeInteraction>) => void;
}

/** A screen to pick as an interaction's destination. */
export interface ScreenChoice {
  value: string;
  label: string;
}

export interface ActionFieldsProps extends InteractionFieldsProps {
  /** The screens an action can show: the page's, except the owner's own. */
  screens: readonly ScreenChoice[];
}
