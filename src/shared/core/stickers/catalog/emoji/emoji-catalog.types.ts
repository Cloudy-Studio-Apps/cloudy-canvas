import type { StickerGroup } from "../sticker-catalog.types";

/** The fields of an `emojibase-data` compact record this catalog reads. */
export interface EmojiRecord {
  hexcode: string;
  label: string;
  group?: number;
  order?: number;
  tags?: string[];
}

/** An emoji group of the picker and the Emojibase group it lists. */
export interface EmojiGroup extends StickerGroup {
  /** The Emojibase group number. */
  group: number;
}
