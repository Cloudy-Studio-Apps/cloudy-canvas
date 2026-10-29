import type { CanvasDocument, CanvasProduct } from "@canvas";
import type { BoardToolOptions } from "@board";
import type { ViewerPart } from "@board/modules/viewer/ui";

/** An exported board, ready to draw. */
export interface ViewerBoard {
  product: CanvasProduct<BoardToolOptions>;
  document: CanvasDocument;
  parts: readonly ViewerPart[];
}
