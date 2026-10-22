/** What the user chose to snap in one product's editor (unset: the product's default). */
export interface SnapPreference {
  objects?: boolean;
  pixelGrid?: boolean;
  guides?: boolean;
}

export interface SnappingState {
  /** Product id → its snapping choice. */
  byProduct: Record<string, SnapPreference>;
  save: (product: string, patch: SnapPreference) => void;
}
