import type { Size } from "@canvas";

import type { FrameElement } from "../../frame";
import type { SidePart } from "../model";

/**
 * One page of the PDF: a frame (or half a spread frame), or a blank page of the brochure's size,
 * with the layout sides it shows (indexes into `sides`: two for a spread printed whole).
 */
export type PrintedPage =
  | { kind: "frame"; frame: FrameElement; part: SidePart; sides: readonly number[] }
  | { kind: "blank"; size: Size; sides: readonly number[] };
