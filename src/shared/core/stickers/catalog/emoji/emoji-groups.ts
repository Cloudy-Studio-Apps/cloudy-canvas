import type { EmojiGroup } from "./emoji-catalog.types";

/**
 * Emojibase groups in picker order (skin-tone components are left out). Small and static, so the
 * groups exist before the emoji catalog itself loads.
 */
export const EMOJI_GROUPS: readonly EmojiGroup[] = [
  { group: 0, id: "smileys", label: "Smileys & emotion" },
  { group: 1, id: "people", label: "People & body" },
  { group: 3, id: "nature", label: "Animals & nature" },
  { group: 4, id: "food", label: "Food & drink" },
  { group: 5, id: "travel", label: "Travel & places" },
  { group: 6, id: "activities", label: "Activities" },
  { group: 7, id: "objects", label: "Objects" },
  { group: 8, id: "symbols", label: "Symbols" },
  { group: 9, id: "flags", label: "Flags" },
].map((group, i) => ({ ...group, order: (i + 1) * 10, tab: "emojis" as const }));
