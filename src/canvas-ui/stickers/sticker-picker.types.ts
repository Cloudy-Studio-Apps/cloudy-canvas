import type { PickedSticker, StickerDef, StickerSection } from "@shared/core";

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

export interface StickerWheelProps {
  /** The catalog id of the sticker the tool stamps now. */
  activeId: string | undefined;
  /** Makes a sticker the one the tool stamps (its picture loaded). */
  onPicked: (sticker: PickedSticker) => void;
}
