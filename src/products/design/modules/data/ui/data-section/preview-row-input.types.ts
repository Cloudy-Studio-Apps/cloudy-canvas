export interface PreviewRowInputProps {
  /** The rows to step through (≥ 1). */
  count: number;
  /** The row shown, 0-based (clamped to the rows). */
  value: number;
  /** Shows row `row` (0-based); a drag of the field is one undo step. */
  onChange: (row: number) => void;
  /** The label before it; "Preview row" when left out. */
  label?: string;
}
