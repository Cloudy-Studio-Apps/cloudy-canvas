import type { Point } from "@canvas";

import type { ErModel } from "./er-model";

/** The ER element types the palette offers. */
export type ErPaletteItemId =
  | "entity"
  | "weak-entity"
  | "relation"
  | "associative"
  | "attribute"
  | "key-attribute"
  | "isa"
  | "union"
  | "aggregate"
  | "constraint";

/**
 * What dropping a palette item would do where the pointer is: `label` says it ("Attribute of
 * Customer", or why it can't), and `run` (only when it can) makes the edit in the board's ER
 * diagrams (in the right one, or a new one) and returns the new shape's id.
 */
export type ErDrop =
  | { ok: true; label: string; run: (er: ErModel, at: Point) => string | undefined }
  | { ok: false; label: string };
