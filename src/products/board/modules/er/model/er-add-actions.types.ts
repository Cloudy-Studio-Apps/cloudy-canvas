import type { ErPaletteItemId } from "./er-drop.types";

/** Adding one ER element type from a click: placed automatically, next to what it belongs to. */
export interface ErAddAction {
  id: ErPaletteItemId;
  /** What it adds ("Hierarchy under Person"), or why it can't. */
  label: string;
  disabled: boolean;
  /** Adds it and returns the new shape's id. */
  run: () => string | undefined;
}
