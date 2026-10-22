export interface CopyRowProps {
  label: string;
  /** What's shown and copied. Multi-line values are shown as a block. */
  value: string;
  /** Where the value goes, shown under it and in the copied toast. */
  hint?: string;
  disabled?: boolean;
}
