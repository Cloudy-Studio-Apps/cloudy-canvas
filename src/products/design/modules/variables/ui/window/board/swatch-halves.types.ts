export interface SwatchHalvesProps {
  /** `#RRGGBBAA`, one per mode shown. */
  colors: readonly string[];
  /** Per color, whether that mode only repeats the first one's. */
  faded?: readonly boolean[];
  className?: string;
}
