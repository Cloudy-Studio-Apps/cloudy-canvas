import type { StyleRecord, VariableRecord } from "@canvas";

export interface UnusedRowProps {
  record: VariableRecord | StyleRecord;
  /** Where it is: its collection, or its kind of style. */
  where: string;
  /** A color variable's value now, for its swatch. */
  color?: string;
  checked: boolean;
  onCheckedChange(checked: boolean): void;
}
