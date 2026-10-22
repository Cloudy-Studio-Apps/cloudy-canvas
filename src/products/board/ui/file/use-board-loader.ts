import { boardMigrations, openBoardDocument } from "@board";
import { CanvasDocument } from "@canvas";
import { useCanvasFileLoader, type CanvasFileLoadState } from "@canvas-ui";
import { getBoardModules, getBoardProduct } from "../modules";

/**
 * Loads the board with this id (brought up to date by the modules' migrations), or starts an
 * empty one when the id isn't a saved file (a board just created from Home).
 */
export function useBoardLoader(id: string): CanvasFileLoadState {
  return useCanvasFileLoader(id, {
    noun: "board",
    open: (bytes) =>
      openBoardDocument(bytes, getBoardProduct().kinds, getBoardModules().get(boardMigrations)),
    create: () => new CanvasDocument(getBoardProduct().kinds),
  });
}
