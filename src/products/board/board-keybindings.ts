import { BASE_KEYBINDINGS, type Keybindings } from "@canvas";

/** Commands the board editor implements (see `CanvasProduct.hostCommands`). */
export const BOARD_HOST_COMMANDS = {
  openLibrary: "openLibrary",
} as const;

/** Names of the board's host commands, for shortcut lists and tooltips. */
export const BOARD_HOST_COMMAND_LABELS: Record<keyof typeof BOARD_HOST_COMMANDS, string> = {
  openLibrary: "Widgets, templates and more",
};

/** The board's shortcuts: the shared ones plus its tools. */
export const BOARD_KEYBINDINGS = {
  ...BASE_KEYBINDINGS,
  "tool.marker": [{ key: "m" }],
  "tool.eraser": [{ key: "e", shift: true }],
  "tool.sticky": [{ key: "s" }],
  "tool.text": [{ key: "t" }],
  "tool.shape": [{ key: "r" }],
  "tool.section": [{ key: "s", shift: true }],
  "tool.table": [{ key: "g" }],
  "tool.connector": [{ key: "x" }],
  "tool.db": [{ key: "d" }],
  "tool.er": [{ key: "e" }],
  "tool.sticker": [{ key: "k" }],
  [BOARD_HOST_COMMANDS.openLibrary]: [{ key: "i", shift: true }],
} satisfies Keybindings;
