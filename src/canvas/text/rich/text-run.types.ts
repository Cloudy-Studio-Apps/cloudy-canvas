/**
 * A range of a text styled its own way: characters `start` to `end` (UTF-16 indexes, `end`
 * excluded) take `style` over the text's own. The style's fields are the product's (a design
 * text's font, size, fills…); the engine only splits, merges and moves runs as the text changes.
 */
export interface TextRun<S extends object = Record<string, unknown>> {
  start: number;
  end: number;
  style: S;
}
