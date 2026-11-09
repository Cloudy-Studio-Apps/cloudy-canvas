import type { BoardEngine } from "@board";
import { useAgentFile, type CanvasFileContextValue } from "@canvas-ui";
import { boardFiles } from "./active-board";

/** Registers this board for agents under its tab while its editor is mounted. */
export function useAgentBoard(id: string, engine: BoardEngine, file: CanvasFileContextValue): void {
  useAgentFile(boardFiles, id, engine, file);
}
