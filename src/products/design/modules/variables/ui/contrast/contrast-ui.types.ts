import type { VariableRecord } from "@canvas";

import type { ContrastCheck, ContrastGrade } from "../../contrast";

export interface ContrastRowProps {
  check: ContrastCheck;
  /** The variable whose inspector shows it: the row names the other side. */
  from: string;
  onRemove?: () => void;
}

export interface ContrastPairsListProps {
  variable: VariableRecord;
}

export interface GradeBadgeProps {
  grade: ContrastGrade;
}

export interface PartnerPickerProps {
  variable: VariableRecord;
}
