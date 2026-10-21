export interface ColorSwatchProps {
  label: string;
  /** Document content color (not a theme token). */
  color: string;
  selected: boolean;
  onSelect: () => void;
  shape?: "square" | "circle";
}
