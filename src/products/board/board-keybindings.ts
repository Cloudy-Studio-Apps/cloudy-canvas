import { BASE_KEYBINDINGS, type Keybindings } from "@canvas";

/** The board's shortcuts: the shared ones plus its tools. */
export const BOARD_KEYBINDINGS = {
  ...BASE_KEYBINDINGS,
  "tool.marker": [{ key: "m" }],
  "tool.sticky": [{ key: "s" }],
  "tool.text": [{ key: "t" }],
  "tool.shape": [{ key: "r" }],
  "tool.section": [{ key: "s", shift: true }],
  "tool.table": [{ key: "g" }],
  "tool.connector": [{ key: "x" }],
  "tool.db": [{ key: "d" }],
  "tool.er": [{ key: "e" }],
  "tool.sticker": [{ key: "k" }],
} satisfies Keybindings;
