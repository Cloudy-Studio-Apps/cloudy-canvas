import { COMMON_STICKERS, type StickerDef } from "@board";
import { WHEEL_SLOTS } from "../stores/sticker-recents-store";

/** The wheel's stickers: the recent ones that still exist, topped up with the common stamps. */
export function wheelSlots(
  recents: readonly string[],
  lookup: (id: string) => StickerDef | undefined,
): StickerDef[] {
  const slots: StickerDef[] = [];
  const add = (sticker: StickerDef | undefined) => {
    if (sticker && slots.length < WHEEL_SLOTS && !slots.some((s) => s.id === sticker.id)) {
      slots.push(sticker);
    }
  };
  recents.forEach((id) => add(lookup(id)));
  COMMON_STICKERS.forEach(add);
  return slots;
}
