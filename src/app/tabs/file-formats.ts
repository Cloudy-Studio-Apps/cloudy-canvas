import type { CanvasFileFormat } from "@canvas-ui/file/canvas-file.types";
import type { FileType } from "@shared/core";

/** Each product's file format, imported with the product (its editor has loaded it already). */
export const FILE_FORMATS: Record<FileType, () => Promise<CanvasFileFormat>> = {
  board: () => import("@board/ui").then((ui) => ui.BOARD_FILE_FORMAT),
  design: () => import("@design/ui").then((ui) => ui.DESIGN_FILE_FORMAT),
};
