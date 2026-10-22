import type { BoardEngine } from "@board";
import { useCanvasFileSaver, type CanvasFileContextValue } from "@canvas-ui";
import type { FileInfo } from "@shared/core";
import { BOARD_FILE_FORMAT } from "./board-file-format";

/** Saves and autosaves the board to its `.cboard` file (see `useCanvasFileSaver`). */
export function useBoardSaver(
  id: string,
  engine: BoardEngine,
  info: FileInfo | null,
): CanvasFileContextValue {
  return useCanvasFileSaver(id, engine, info, BOARD_FILE_FORMAT);
}
