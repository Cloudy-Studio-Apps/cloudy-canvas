import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import type { DocImage, FillGroup, HarmonyId } from "../..";
import type { PaletteColor, SourceTab } from "../store";

export interface PaletteSwatchProps {
  color: PaletteColor;
  index: number;
  /** The palette's size (removing stops at two, adding at eight). */
  count: number;
}

export interface InsertSeamProps {
  /** Where the new color goes (between `at - 1` and `at`). */
  at: number;
}

export interface HarmonyIconProps {
  harmony: HarmonyId;
}

export interface HarmonyPickerProps {
  value: HarmonyId;
  onChange: (harmony: HarmonyId) => void;
  /** Offer Custom (moving each color on its own). Default true. */
  custom?: boolean;
}

/** A source tab: its label, icon and panel. */
export interface SourceTabEntry {
  id: SourceTab;
  label: string;
  icon: LucideIcon;
  panel: () => ReactNode;
}

export interface SectionLabelProps {
  children: ReactNode;
  aside?: ReactNode;
  className?: string;
}

export interface FillGroupRowProps {
  group: FillGroup;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}

export interface GalleryCardProps {
  colors: readonly string[];
  label: string;
  picked: boolean;
  saved: boolean;
  onUse: () => void;
  onToggleSaved: () => void;
}

export interface ImageThumbProps {
  image: DocImage;
  selected: boolean;
  onPick: () => void;
}

export interface ImagePinsProps {
  /** The image to read (an asset's or a file's URL). */
  url: string;
}
