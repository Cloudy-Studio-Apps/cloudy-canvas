import compact from "emojibase-data/en/compact.json";

import type { StickerDef, StickerSection } from "../sticker-catalog.types";
import type { EmojiRecord } from "./emoji-catalog.types";

// Loaded with a dynamic import (it's large): only the picker's Emojis tab reaches it.

/** Twemoji's art, one file per emoji (`1f44d.svg`, `1f636-200d-1f32b.svg`), as asset URLs. */
const FILES = import.meta.glob<string>("/node_modules/@twemoji/svg/*.svg", {
  query: "?url&no-inline",
  import: "default",
  eager: true,
});

const URLS = new Map(
  Object.entries(FILES).map(([path, url]) => [path.slice(path.lastIndexOf("/") + 1, -4), url]),
);

/** Emojibase groups in picker order (skin-tone components are left out). */
const GROUPS: { group: number; id: string; label: string }[] = [
  { group: 0, id: "smileys", label: "Smileys & emotion" },
  { group: 1, id: "people", label: "People & body" },
  { group: 3, id: "nature", label: "Animals & nature" },
  { group: 4, id: "food", label: "Food & drink" },
  { group: 5, id: "travel", label: "Travel & places" },
  { group: 6, id: "activities", label: "Activities" },
  { group: 7, id: "objects", label: "Objects" },
  { group: 8, id: "symbols", label: "Symbols" },
  { group: 9, id: "flags", label: "Flags" },
];

/** Twemoji names files by the lowercase code points, usually without the FE0F selectors. */
function emojiUrl(hexcode: string): string | undefined {
  const name = hexcode.toLowerCase();
  return URLS.get(name) ?? URLS.get(name.replace(/-fe0f/g, ""));
}

function toSticker(emoji: EmojiRecord): StickerDef | null {
  const url = emojiUrl(emoji.hexcode);
  if (!url) return null;
  return {
    id: `emoji:${emoji.hexcode.toLowerCase()}`,
    label: emoji.label.charAt(0).toUpperCase() + emoji.label.slice(1),
    keywords: emoji.tags ?? [],
    url,
  };
}

/** Every emoji with art, grouped as in the Unicode emoji list. */
export const EMOJI_SECTIONS: readonly StickerSection[] = GROUPS.map(({ group, id, label }) => ({
  id,
  label,
  stickers: (compact as EmojiRecord[])
    .filter((emoji) => emoji.group === group)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .map(toSticker)
    .filter((sticker) => sticker !== null),
}));
