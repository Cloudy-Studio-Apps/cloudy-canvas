import type { StickerDef, StickerGroup } from "./catalog";

/** A group and who registered it (`undefined`: the app). */
export interface RegisteredGroup {
  group: StickerGroup;
  owner: string | undefined;
}

/** Stickers added to a group and who added them. */
export interface RegisteredSet {
  groupId: string;
  stickers: readonly StickerDef[];
  owner: string | undefined;
}
