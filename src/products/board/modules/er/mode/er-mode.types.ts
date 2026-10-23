import type { Shortcut } from "@shared/core";

import type { ErPaletteItemId } from "../model/er-drop.types";

/** One of the ER mode's keys: the host command, the palette item it adds and its shortcut. */
export interface ErModeCommand {
  command: string;
  item: ErPaletteItemId;
  label: string;
  keys: readonly Shortcut[];
}
