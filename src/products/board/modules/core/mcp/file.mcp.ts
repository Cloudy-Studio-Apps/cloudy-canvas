import { requireBoard } from "../../../mcp/board-access";
import type { BoardMcpTool } from "../../../mcp/board-mcp.types";

const NO_ARGS = { type: "object", properties: {} };

export const fileTools: BoardMcpTool[] = [
  {
    name: "save_board",
    description:
      "Saves the open board to its .cboard file. A board that was never saved asks the user " +
      "where to save it, so the call returns before the file is written.",
    inputSchema: NO_ARGS,
    run: async (host) => {
      const board = requireBoard(host);
      if (!board.path) {
        // The save dialog waits for the user; the editor reports a failed save itself.
        board.save().catch(() => undefined);
        return "Asked the user where to save the board.";
      }
      await board.save();
      return `Saved to ${board.path}.`;
    },
  },
];
