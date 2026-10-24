/** The `styleType` of paint (color) styles: a fills or strokes stack. */
export const PAINT_STYLE = "paint";

/** The `styleType` of effect styles: an effects stack. */
export const EFFECT_STYLE = "effect";

/** The `styleType` of stroke styles: weight, position, dashes, caps and joins (not the paints). */
export const STROKE_STYLE = "stroke";

/**
 * Where a node's stroke style is bound. Paint styles bind at `fills`/`strokes` and effect styles
 * at `effects`, the fields they replace; a stroke style sets several, so it has a path of its own.
 */
export const STROKE_STYLE_PATH = "strokeStyle";
