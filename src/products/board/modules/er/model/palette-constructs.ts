import type { ErPaletteItemId } from "./er-drop.types";

/** The construct each palette item adds, when it's one a standard may forbid. */
export const PALETTE_CONSTRUCTS: Readonly<Partial<Record<ErPaletteItemId, string>>> = {
  "weak-entity": "weak-entities",
  associative: "associative-entities",
  isa: "hierarchies",
  union: "unions",
  aggregate: "aggregations",
  constraint: "constraints",
};
