import type { Point } from "@canvas";

import type { ErEdits } from "./er-edits";

/** The ER element types the palette offers. */
export type ErPaletteItemId =
  | "entity"
  | "weak-entity"
  | "relation"
  | "attribute"
  | "key-attribute"
  | "isa"
  | "aggregate"
  | "constraint";

/**
 * What dropping a palette item would do where the pointer is: `label` says it ("Attribute of
 * Customer", or why it can't), and `run` (only when it can) makes the edit and returns the new
 * shape's id.
 */
export type ErDrop =
  | {
      ok: true;
      label: string;
      /** The diagram whose edits `run` takes: the shown one, or the one of what it attaches to. */
      diagram: string;
      run: (edits: ErEdits, at: Point) => string | undefined;
    }
  | { ok: false; label: string };
