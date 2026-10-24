/** How a sticker is drawn: what can be changed on a built-in sticker's art. */
export interface StickerLook {
  /** The die-cut edge's color (white by default). */
  edgeColor: string;
}

/** A sticker the picker offers. */
export interface StickerDef {
  /**
   * `<set>:<name>`, e.g. `seal:happy`, `common:heart`, `emoji:1f44d`, `custom:<id>`,
   * `plugin:<plugin id>:<name>`.
   */
  id: string;
  label: string;
  /** Extra words the search matches. */
  keywords: readonly string[];
  /** Where the picture is loaded from (an SVG data URL for the built-in art). */
  url: string;
  /** Its SVG markup drawn with another look; only stickers with a die-cut edge of their own. */
  restyle?: (look: StickerLook) => string;
}

/** Which tab of the picker lists a group. */
export type StickerTab = "stickers" | "emojis";

/** A titled group of stickers in the picker: built-in, emoji or a plugin's. */
export interface StickerGroup {
  id: string;
  label: string;
  description?: string;
  /** Groups are listed by it, lowest first (the seals are 10, the common stamps 20). */
  order: number;
  /** `stickers` when missing. */
  tab?: StickerTab;
}

/** A titled group of stickers in the picker. */
export interface StickerSection {
  id: string;
  label: string;
  description?: string;
  stickers: readonly StickerDef[];
}

/** A group the app ships, with its stickers. */
export interface BuiltInStickerGroup extends StickerGroup {
  stickers: readonly StickerDef[];
}
