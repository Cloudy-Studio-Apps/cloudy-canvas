/**
 * A ready-made start for a new file, shown on Home's first run ("Start from"). A module contributes
 * it to its product's starters point; Home opens `/<product>/<new id>?starter=<id>` and the editor
 * runs `start` once on the empty document.
 */
export interface CanvasStarter<E> {
  /** Unique in its product; the `?starter=` value. */
  id: string;
  label: string;
  /** A short line saying what it starts with. */
  description: string;
  /** A picture of the result (an imported image's URL), drawn on a transparent background. */
  preview: string;
  /** Lower first. */
  order?: number;
  /**
   * Fills the new document, synchronously. Its edits aren't in the user's undo history, so the
   * first Ctrl+Z doesn't empty the file. It may also switch the mode or move the view.
   */
  start: (engine: E) => void;
}
