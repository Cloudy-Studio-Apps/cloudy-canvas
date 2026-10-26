import type { ReactNode } from "react";

import type {
  Formula,
  FormulaChain,
  FormulaRounding,
  FormulaStep,
  FormulaValue,
  ModeContext,
  VariableRecord,
} from "@canvas";

export interface ExpressionBuilderProps {
  variable: VariableRecord;
  /** `DEFAULT_VALUE`, or a mode id: the value it writes. */
  mode: string;
  /** The expression there now (references by id), or `null` to start from `start`. */
  expr: string | null;
  /** What a new formula starts from (the number there now). */
  start: number;
  /** The modes its result is shown in. */
  modes: ModeContext;
  /** The trigger. */
  children: ReactNode;
}

export interface FormulaEditorProps {
  formula: Formula;
  onChange: (formula: Formula) => void;
  modes: ModeContext;
}

export interface ChainEditorProps {
  chain: FormulaChain;
  onChange: (chain: FormulaChain) => void;
  modes: ModeContext;
  /** How many groups it's inside (0 at the top); groups stop nesting at `MAX_GROUP_DEPTH`. */
  depth: number;
}

export interface FormulaStepRowProps {
  step: FormulaStep;
  /** Its place, for its label ("then"). */
  index: number;
  onChange: (step: FormulaStep) => void;
  onRemove: () => void;
  modes: ModeContext;
  /** How many groups its row is inside. */
  depth: number;
}

export interface OperandFieldProps {
  operand: FormulaValue;
  onChange: (operand: FormulaValue) => void;
  modes: ModeContext;
  label: string;
}

export interface FormulaLimitProps {
  label: string;
  limit: FormulaValue | null;
  onChange: (limit: FormulaValue | null) => void;
  modes: ModeContext;
  /** What a limit starts as when turned on. */
  fallback: number;
}

export interface FormulaPreviewProps {
  /** The expression (references by id). */
  expr: string;
  modes: ModeContext;
}

export interface RoundingOption {
  value: FormulaRounding;
  label: string;
  title: string;
}
