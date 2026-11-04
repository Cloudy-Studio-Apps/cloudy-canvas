import type { TextNodeRun } from "../../text";
import type { FieldFormat } from "../source";

/** A text with `{{ }}` fields: its text and the style runs over it. */
export interface DataTemplate {
  text: string;
  runs: TextNodeRun[];
}

/** A layer property filled from a field. `path` is an expression in scope. */
export interface DataBinding {
  path: string;
  format?: FieldFormat;
}

export type ConditionOp = "exists" | "empty" | "eq" | "neq" | "gt" | "lt" | "contains";

/** A layer shows only while this holds. */
export interface DataCondition {
  path: string;
  op: ConditionOp;
  value?: string | number;
}

/**
 * The data fields a layer carries. `dataBindings` keys are field paths as `BindableField.path`
 * (`"fills.0.color"`, `"opacity"`), plus `"fills.<i>.image"` for an image paint.
 */
export interface NodeDataFields {
  dataText?: DataTemplate;
  dataBindings?: Record<string, DataBinding>;
  dataVisible?: DataCondition;
  dataHideEmpty?: boolean;
}
