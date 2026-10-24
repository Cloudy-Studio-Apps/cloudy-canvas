import type { VariableRecord } from "@canvas";

import type { BoardMode } from "../board-model.types";

export interface SameAsFirstProps {
  variable: VariableRecord;
  mode: BoardMode;
  firstName: string;
}
