export interface PaletteFavoritesState {
  /** Saved palettes (each a list of `#RRGGBB`), newest first. */
  palettes: string[][];
  /** Saves a palette, or removes it when it's saved already. */
  toggle: (palette: readonly string[]) => void;
}
