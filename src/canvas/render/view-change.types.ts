/**
 * How an element changed since its view last drew it: `same` (nothing to do), `moved` (only its
 * `x`/`y`, so the view only moves) or `redraw` (its kind draws it again).
 */
export type ViewChange = "same" | "moved" | "redraw";
