import type { ModeAxisRecord, ModeDef, VariableRecord } from "@canvas";

import type { BoardMode } from "../board-model.types";

export interface VariableInspectorProps {
  variable: VariableRecord;
}

export interface ModeValueCardProps {
  variable: VariableRecord;
  mode: BoardMode;
  /** The first mode (its value is the default the others fall back to). */
  first: boolean;
}

export interface InspectorPartProps {
  variable: VariableRecord;
}

export interface InspectorSectionProps {
  title: string;
  /** Controls on the right of the title. */
  actions?: React.ReactNode;
  children: React.ReactNode;
}

/** A mode being dragged between mode groups. */
export interface ModeDrag {
  modeId: string;
  axisId: string;
}

/** What the mode groups do: move a mode (into a group, before a mode of it), or into a new one. */
export interface ModeMoves {
  drag: ModeDrag | null;
  setDrag: (drag: ModeDrag | null) => void;
  move: (modeId: string, axisId: string, beforeId?: string) => void;
  moveToNewGroup: (modeId: string) => void;
}

export interface ModeGroupCardProps {
  axis: ModeAxisRecord;
  /** The group the board shows. */
  shown: boolean;
  moves: ModeMoves;
}

export interface ModeRowProps {
  axis: ModeAxisRecord;
  mode: ModeDef;
  /** Its group's first mode: its values are the defaults, so it stays put. */
  first: boolean;
  moves: ModeMoves;
}

export interface MoveModeMenuProps {
  axis: ModeAxisRecord;
  mode: ModeDef;
  moves: ModeMoves;
}
