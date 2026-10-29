import type { CanvasElement, CanvasEngine } from "@canvas";
import type { ViewerPart } from "../viewer-part.types";

export interface ViewerClicksOptions {
  engine: CanvasEngine | null;
  /** The parts a click can reach (with data in the file, or a `click` of their own). */
  parts: readonly ViewerPart[];
  onClick(part: ViewerPart, element: CanvasElement): void;
}
