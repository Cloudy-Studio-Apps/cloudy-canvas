import type { ThemeAppearance, ThemePreview } from "@shared/core";

export interface ThemeGridProps {
  /** Only themes of this appearance (`system` mode's slots); all when unset. */
  appearance?: ThemeAppearance;
  /** The theme ticked. */
  selectedId: string;
  onSelect: (id: string) => void;
}

export interface ThemePreviewPictureProps {
  preview: ThemePreview;
}
