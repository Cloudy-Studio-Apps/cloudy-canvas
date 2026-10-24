import type { ScaleStep, Shade, VariableRecord } from "@canvas";

import type { BoardMode } from "../board-model.types";

export interface ColorCardProps {
  variable: VariableRecord;
  shown: readonly BoardMode[];
  selected: boolean;
}

export interface NumberCardProps {
  variable: VariableRecord;
  shown: readonly BoardMode[];
  /** The largest value in its group (bars scale to it). */
  max: number;
  selected: boolean;
}

export interface NumberVisualProps {
  kind: string;
  value: number;
  max: number;
}

export interface GhostShadeCardProps {
  shade: Shade;
  /** Its color in each shown mode. */
  colors: readonly string[];
  /** What the generator does to it: a new variable, an update, or the base itself. */
  state: "new" | "update" | "base";
}

export interface GroupSectionProps {
  group: string;
  items: readonly VariableRecord[];
}

export interface GroupTitleProps {
  group: string;
  count: number;
  label: string;
}

export interface AddCardMenuProps {
  group: string;
  items: readonly VariableRecord[];
}

export interface ShadePreviewSectionProps {
  group: string;
  /** The group's variables (those the shades replace are left out). */
  rest: readonly VariableRecord[];
}

export interface NewGroupMenuProps {
  /** The trigger's look: a text button, or the empty state's primary one. */
  variant?: "link" | "primary";
}

export interface GhostNumberCardProps {
  step: ScaleStep;
  kind: string;
  max: number;
  state: "new" | "update" | "base";
}

export interface ScalePreviewSectionProps {
  group: string;
  rest: readonly VariableRecord[];
}

/** A text or boolean variable's card. */
export interface PlainCardProps {
  variable: VariableRecord;
  shown: readonly BoardMode[];
  selected: boolean;
}
