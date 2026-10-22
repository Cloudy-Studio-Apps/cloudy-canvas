import type { CanvasEngine } from "../canvas-engine";

/** How a product names and reaches the align, distribute and tidy up tools (`arrangeTools`). */
export interface ArrangeToolsOptions<H> {
  /** The tools' name suffix: `align_<noun>`, `distribute_<noun>`, `tidy_up_<noun>`. */
  noun: string;
  /** What the descriptions call the elements ("shapes", "layers"). */
  things: string;
  /** What one element aligns with, for the description ("the section it's in"). */
  holder: string;
  /** The open canvas, and the ids after checking they exist. Throws when either is missing. */
  resolve(host: H, ids: string[]): { engine: CanvasEngine; ids: string[] };
}
