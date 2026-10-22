export interface SegmentedProps {
  "aria-label": string;
  value: boolean;
  /** Labels and tooltips for false and true. */
  off: { label: string; title: string };
  on: { label: string; title: string };
  onChange: (value: boolean) => void;
}
