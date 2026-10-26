import type { BoardWorkspace } from "../board-engine.types";
import type { AgentBoard, AgentHost } from "./board-mcp.types";

export function requireBoard(host: AgentHost): AgentBoard {
  const board = host.board();
  if (!board) throw new Error("No board is open. Call open_board or new_board first.");
  return board;
}

/** The ids, after checking each is a shape on the board. */
export function requireShapes(engine: BoardWorkspace, ids: string[]): string[] {
  const missing = ids.find((id) => !engine.getElement(id));
  if (missing) throw new Error(`No shape with id ${missing}.`);
  return ids;
}
