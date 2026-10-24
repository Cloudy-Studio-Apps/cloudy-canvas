import type { StickerTab } from "@shared/core";

/** A sticker group a plugin adds (`api.stickers.registerGroup`). */
export interface PluginStickerGroup {
  /** Unique among every group; `registerSet` names it. */
  id: string;
  label: string;
  description?: string;
  /** Groups are listed by it, lowest first (the seals are 10, the common stamps 20). */
  order: number;
  /** The picker's tab that lists it: `stickers` (the default) or `emojis`. */
  tab?: StickerTab;
}

/**
 * A sticker a plugin adds. Its picture is one of: `art` (SVG markup on the 128-unit grid, given
 * the built-in stickers' die-cut edge, which the design can recolor), `svg` (a whole SVG file),
 * `data` (an image file's bytes, e.g. from `api.plugin.readAsset`, with its `type`) or `url`.
 */
export interface PluginSticker {
  /** Unique in the plugin; the sticker's id is `plugin:<plugin id>:<name>`. */
  name: string;
  label: string;
  keywords?: string[];
  art?: string;
  /** `<defs>` content `art` uses (gradients). */
  defs?: string;
  svg?: string;
  data?: Uint8Array;
  /** `data`'s media type (`image/png`, …); `image/png` when missing. */
  type?: string;
  url?: string;
}

/** `api.stickers`: stickers for both products' pickers (and agents). */
export interface PluginStickersApi {
  /** Adds a group of the picker. */
  registerGroup(group: PluginStickerGroup): void;
  /** Adds stickers to a group: a built-in one (`seal`, `common`, `smileys`, …), or a new one. */
  registerSet(groupId: string, stickers: PluginSticker[]): void;
  /** Wraps artwork on the 128-unit grid with the die-cut edge, as SVG markup. */
  stickerSvg(art: string, defs?: string): string;
}

/** What a plugin's `activate` staged: committed to the catalog once it succeeds. */
export interface PluginStickerStage {
  api: PluginStickersApi;
  /** Adds what was staged to `stickerCatalog`; returns how many stickers. Throws on a clash. */
  commit(): number;
}
