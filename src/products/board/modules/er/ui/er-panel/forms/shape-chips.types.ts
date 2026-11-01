export interface ShapeChip {
  id: string;
  label: string;
  /** Takes it out of the list. */
  onRemove: () => void;
  removeLabel: string;
}

export interface ShapeChipsProps {
  chips: readonly ShapeChip[];
}
