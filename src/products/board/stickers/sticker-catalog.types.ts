/** A sticker the picker offers. */
export interface StickerDef {
  /** `<set>:<name>`, e.g. `seal:happy`, `common:heart`, `emoji:1f44d`, `custom:<id>`. */
  id: string;
  label: string;
  /** Extra words the search matches. */
  keywords: readonly string[];
  /** Where the picture is loaded from (an SVG data URL for the built-in art). */
  url: string;
}

/** A titled group of stickers in the picker. */
export interface StickerSection {
  id: string;
  label: string;
  stickers: readonly StickerDef[];
}
