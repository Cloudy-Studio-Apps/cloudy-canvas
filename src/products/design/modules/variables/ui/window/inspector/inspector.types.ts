import type { VariableRecord } from "@canvas";

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
