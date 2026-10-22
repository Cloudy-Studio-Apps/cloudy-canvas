import type { BoardEngine } from "@board";
import { useAgentFile, type CanvasFileContextValue } from "@canvas-ui";
import { activeBoard } from "./active-board";

/** Makes this board the one agents act on while it's open. */
export function useAgentBoard(id: string, engine: BoardEngine, file: CanvasFileContextValue): void {
  useAgentFile(activeBoard, id, engine, file);
}
