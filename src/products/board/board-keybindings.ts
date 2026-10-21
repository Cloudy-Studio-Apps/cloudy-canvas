import { BASE_KEYBINDINGS, type Keybindings } from "@canvas";

/** The board's shortcuts: the shared ones plus its tools. */
export const BOARD_KEYBINDINGS = {
  ...BASE_KEYBINDINGS,
  "tool.marker": [{ key: "m" }],
  "tool.sticky": [{ key: "s" }],
  "tool.shape": [{ key: "r" }],
} satisfies Keybindings;
