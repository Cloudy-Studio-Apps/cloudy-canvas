export interface CardinalityPickerProps {
  min: string;
  max: string;
  onChange: (min: string, max: string) => void;
  /** Allows "none" (both empty), for hierarchies where the cardinality is optional. */
  optional?: boolean;
}
