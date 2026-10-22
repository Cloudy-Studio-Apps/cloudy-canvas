import type { StickerDef, StickerSection } from "@board";

export interface StickerCellProps {
  sticker: StickerDef;
  active: boolean;
  onPick: (sticker: StickerDef) => void;
  /** Shows a remove button on hover (the user's own stickers). */
  onRemove?: (sticker: StickerDef) => void;
}

export interface StickerGridProps {
  sections: readonly StickerSection[];
  /** Only stickers matching it are shown; sections left empty are hidden. */
  query: string;
  activeId: string | undefined;
  onPick: (sticker: StickerDef) => void;
  onRemove?: (sticker: StickerDef) => void;
  /** Shown when nothing matches. */
  empty?: string;
}

export interface StickerTabProps {
  query: string;
  activeId: string | undefined;
  onPick: (sticker: StickerDef) => void;
}

export interface StickerPanelProps {
  activeId: string | undefined;
  onPick: (sticker: StickerDef) => void;
}

export interface WheelSlotProps {
  sticker: StickerDef;
  /** Position on the ring, 0 at the top, clockwise. */
  slot: number;
  active: boolean;
  onPick: (sticker: StickerDef) => void;
}
