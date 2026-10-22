/** The fields of an `emojibase-data` compact record this catalog reads. */
export interface EmojiRecord {
  hexcode: string;
  label: string;
  group?: number;
  order?: number;
  tags?: string[];
}
