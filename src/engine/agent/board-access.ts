import type { CanvasEngine } from "../canvas-engine";
import type { AgentBoard, AgentHost } from "./agent-tool.types";

export function requireBoard(host: AgentHost): AgentBoard {
  const board = host.board();
  if (!board) throw new Error("No board is open. Call open_board or new_board first.");
  return board;
}

/** Runs `edit` as its own undo step, so the user can undo one agent call with one Ctrl+Z. */
export function asUndoStep<T>(engine: CanvasEngine, edit: () => T): T {
  let result!: T;
  engine.doc.checkpoint();
  engine.doc.batch(() => {
    result = edit();
  });
  engine.doc.checkpoint();
  return result;
}
