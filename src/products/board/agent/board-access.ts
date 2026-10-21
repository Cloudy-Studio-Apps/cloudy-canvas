import type { AgentBoard, AgentHost } from "./board-agent.types";

export function requireBoard(host: AgentHost): AgentBoard {
  const board = host.board();
  if (!board) throw new Error("No board is open. Call open_board or new_board first.");
  return board;
}
