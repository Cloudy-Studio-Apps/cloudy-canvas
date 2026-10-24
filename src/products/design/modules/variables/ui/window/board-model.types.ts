import type { ModeContext, TokenScope } from "@canvas";

/** What a number group is for: it decides how its cards draw and where pickers offer them. */
export interface NumberKind {
  id: "spacing" | "radius" | "font" | "opacity" | "stroke" | "other";
  label: string;
  /** A short glyph for menus and the outline. */
  icon: string;
  /** The scopes a variable of this kind gets (empty: offered everywhere). */
  scopes: TokenScope[];
  /** A new variable's value. */
  first: number;
  /** A new group's name. */
  group: string;
}

/** A mode the board shows a value in. */
export interface BoardMode {
  /** A mode id, or `DEFAULT_VALUE` without an axis. */
  id: string;
  name: string;
  /** What resolves a variable in it. */
  context: ModeContext;
}
