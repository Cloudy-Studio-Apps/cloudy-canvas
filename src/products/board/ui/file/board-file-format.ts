import { encodeBoardFile } from "@board";
import type { CanvasFileFormat } from "@canvas-ui";

/** How boards are saved: `.cboard` files. */
export const BOARD_FILE_FORMAT: CanvasFileFormat = {
  type: "board",
  noun: "board",
  untitled: "Untitled board",
  encode: (doc) => encodeBoardFile(doc.encode()),
};
