import type { CanvasDocument, CanvasElement, CanvasProduct } from "@canvas";
import type { BoardToolOptions } from "../../../../board-options.types";
import type { FontLoader } from "@shared/core";
import type { ViewerFile } from "../../viewer-file.types";
import type { ViewerPart } from "../viewer-part.types";

export interface ViewerAppProps {
  file: ViewerFile;
  product: CanvasProduct<BoardToolOptions>;
  /** The board, read-only, filled from `file`. */
  document: CanvasDocument;
  fonts: FontLoader;
  /** Every part the viewer's modules contributed (those without data in `file` don't show). */
  parts: readonly ViewerPart[];
}

/** The side panel that's open: whose, and on which element (`null`: opened by its button). */
export interface OpenPanel {
  part: ViewerPart;
  element: CanvasElement | null;
}
