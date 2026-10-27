import type { ThemeAppearance, ThemeFamily, ThemePreview } from "@shared/core";

export interface ThemeGridProps {
  /** Only themes of this appearance (`system` mode's slots); all when unset. */
  appearance?: ThemeAppearance;
  /** The theme ticked. */
  selectedId: string;
  onSelect: (id: string) => void;
  /** Only the families that match it (`matchThemeFamily`). */
  query: string;
}

export interface ThemeSectionProps {
  /** The plugin's name; the app's themes have no heading. */
  heading?: string;
  families: readonly ThemeFamily[];
  selectedId: string;
  onSelect: (id: string) => void;
  /** The variant a two-appearance family shows until one is picked: the app's current one. */
  preferred: ThemeAppearance;
}

export interface ThemeFamilyCardProps {
  family: ThemeFamily;
  selectedId: string;
  onSelect: (id: string) => void;
  preferred: ThemeAppearance;
}

export interface ThemePreviewPictureProps {
  preview: ThemePreview;
}
